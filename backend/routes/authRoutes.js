const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, googleCallback } = require('../controllers/authController');
const passport = require('passport');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/google
// @desc    Redirect to Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth Callback
// @access  Public
router.get(
  '/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }), 
  googleCallback
);

module.exports = router;
