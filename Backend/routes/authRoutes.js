const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { signup, login, getMe, verifyOTP, resendOTP, googleAuth } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOTP
);

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  [body('email').trim().isEmail().withMessage('Valid email is required')],
  validate,
  resendOTP
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// POST /api/auth/google
router.post(
  '/google',
  [body('credential').notEmpty().withMessage('Google credential is required')],
  validate,
  googleAuth
);

// GET /api/auth/me (protected)
router.get('/me', protect, getMe);

module.exports = router;
