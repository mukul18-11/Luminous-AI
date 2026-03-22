const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_TTL_MS = 5 * 24 * 60 * 60 * 1000;

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '5d',
  });
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'PRODUCTION',
    maxAge: AUTH_TTL_MS,
    path: '/',
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'PRODUCTION',
    path: '/',
  });
};

const buildAuthResponse = (user, token, message) => ({
  ...(message ? { message } : {}),
  ...(token ? { token } : {}),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    authProvider: user.authProvider || 'local',
  },
});

const normalizeEmail = (email) => email.trim().toLowerCase();

// @desc    Register a new user and sign them in immediately
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      // If already verified, tell them to login
      if (existingUser.isVerified) {
        return res.status(409).json({ message: 'Email already registered. Please login.' });
      }

      // Legacy unverified users can complete signup without OTP.
      existingUser.name = name;
      existingUser.password = password;
      existingUser.isVerified = true;
      existingUser.otp = null;
      existingUser.otpExpiresAt = null;
      await existingUser.save();

      const token = generateToken(existingUser);
      setAuthCookie(res, token);

      return res.status(200).json(
        buildAuthResponse(existingUser, token, 'Signup successful! Your account is ready.')
      );
    }

    // Create verified user immediately (OTP temporarily removed for signup)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json(buildAuthResponse(user, token, 'Signup successful!'));
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP after signup
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpiresAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check expiry
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified, clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate token since they're now verified
    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json(buildAuthResponse(user, token, 'Email verified successfully!'));
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(normalizedEmail, otp, user.name);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password. Please try again.' });
    }

    // Legacy accounts created before OTP removal should become verified after a valid login.
    if (!user.isVerified) {
      user.isVerified = true;
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();
    }

    // Generate token
    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// @desc    Send forgot-password OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Use Google to sign in instead of resetting a password.',
      });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(normalizedEmail, otp, user.name);

    res.json({ message: 'Password reset OTP sent to your email.', email: normalizedEmail });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { otp, password } = req.body;

    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordOtpExpiresAt');

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    if (!user.resetPasswordOtpExpiresAt || user.resetPasswordOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.password = password;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login or signup with Google ID token
// @route   POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google Sign-In is not configured on the server' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return res.status(400).json({ message: 'Invalid Google account payload' });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split('@')[0],
        email: payload.email.toLowerCase(),
        authProvider: 'google',
        googleId: payload.sub,
        avatar: payload.picture || null,
        isVerified: true,
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.avatar = payload.picture || user.avatar;
      user.name = payload.name || user.name;
      user.isVerified = true;
      if (user.authProvider !== 'local') {
        user.authProvider = 'google';
      }
      await user.save();
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully.' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
};

module.exports = {
  signup,
  login,
  getMe,
  verifyOTP,
  resendOTP,
  googleAuth,
  logout,
  forgotPassword,
  resetPassword,
};
