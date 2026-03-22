const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const buildAuthResponse = (user, token, message) => ({
  ...(message ? { message } : {}),
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
    authProvider: user.authProvider || 'local',
  },
});

// @desc    Register a new user (sends OTP, does NOT return token yet)
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If already verified, tell them to login
      if (existingUser.isVerified) {
        return res.status(409).json({ message: 'Email already registered. Please login.' });
      }
      // If not verified, resend OTP and update details
      const otp = generateOTP();
      existingUser.name = name;
      existingUser.password = password;
      existingUser.otp = otp;
      existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await existingUser.save();

      await sendOTPEmail(email, otp, name);
      return res.status(200).json({
        message: 'OTP resent to your email. Please verify.',
        email,
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    res.status(201).json({
      message: 'Signup successful! Please check your email for the OTP.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP after signup
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpiresAt');
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

    const user = await User.findOne({ email });
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

    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (requires verified email)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please verify your email first.',
        needsVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    res.json(buildAuthResponse(user, token));
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

    res.json(buildAuthResponse(user, token));
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
};

module.exports = { signup, login, getMe, verifyOTP, resendOTP, googleAuth };
