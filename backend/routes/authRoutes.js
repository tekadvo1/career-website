const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, googleCallback, forgotPassword, resetPassword } = require('../controllers/authController');
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

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', resetPassword);

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

const { protect } = require('../middleware/authMiddleware');

const pool = require('../config/db');

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const roleRes = await pool.query('SELECT role_title, analysis_data FROM role_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]);
    let lastRoleAnalysis = null;
    if (roleRes.rows.length > 0) {
      lastRoleAnalysis = {
        role: roleRes.rows[0].role_title,
        analysis: typeof roleRes.rows[0].analysis_data === 'string' 
          ? JSON.parse(roleRes.rows[0].analysis_data) 
          : roleRes.rows[0].analysis_data
      };
    }

    res.json({
      status: 'success',
      user: {
        ...req.user,
        lastRoleAnalysis
      }
    });
  } catch (error) {
    console.error('Error fetching user me:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @route   POST /api/auth/complete-onboarding
// @desc    Mark onboarding as complete
// @access  Private
router.post('/complete-onboarding', protect, async (req, res) => {
  try {
    await pool.query('UPDATE users SET onboarding_completed = TRUE WHERE id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
