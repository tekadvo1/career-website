const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Public
router.post('/verify-email', verifyEmail);

module.exports = router;
