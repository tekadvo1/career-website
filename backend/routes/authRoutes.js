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

// @route   GET /api/auth/public-profile/:username
// @desc    Get public profile data for a user by username (no auth required)
// @access  Public
router.get('/public-profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username - try exact, then case-insensitive, then prefix match
    // prefix match handles "Rakesh Vejendla" finding "rakesh vejendla33"
    let userRes = await pool.query(
      'SELECT id, username, email, created_at, is_public FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    // If no exact match, try prefix: "Rakesh Vejendla" → finds "rakesh vejendla33"
    if (userRes.rows.length === 0) {
      userRes = await pool.query(
        'SELECT id, username, email, created_at, is_public FROM users WHERE LOWER(username) LIKE LOWER($1) ORDER BY created_at DESC LIMIT 1',
        [`${username}%`]
      );
    }

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRes.rows[0];

    // Respect public visibility toggle - if profile is private, block access
    if (!user.is_public) {
      return res.status(403).json({ success: false, message: 'This profile is private', isPrivate: true });
    }

    // Get their most recent role analysis (skills, role title)
    const roleRes = await pool.query(
      'SELECT role_title, analysis_data FROM role_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    // Get their active workspace role
    const wsRes = await pool.query(
      'SELECT role FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    // Get roadmap progress count
    const roadmapRes = await pool.query(
      'SELECT COUNT(*) as count FROM roadmap_progress WHERE user_id = $1',
      [user.id]
    );

    // Get completed projects count
    const projectRes = await pool.query(
      "SELECT COUNT(*) as count FROM user_projects WHERE user_id = $1 AND status = 'completed'",
      [user.id]
    );

    // Get streak from users table
    const streakRes = await pool.query(
      'SELECT current_streak FROM users WHERE id = $1',
      [user.id]
    );

    let roleTitle = 'Software Engineer';
    let skills = ['JavaScript', 'React', 'Node.js'];

    if (roleRes.rows.length > 0) {
      roleTitle = roleRes.rows[0].role_title || roleTitle;
      const analysis = typeof roleRes.rows[0].analysis_data === 'string'
        ? JSON.parse(roleRes.rows[0].analysis_data)
        : roleRes.rows[0].analysis_data;
      if (analysis?.technicalSkills?.length > 0) skills = analysis.technicalSkills.slice(0, 5);
      else if (analysis?.existingSkills?.length > 0) skills = analysis.existingSkills.map((s) => s.name).slice(0, 5);
    } else if (wsRes.rows.length > 0) {
      roleTitle = wsRes.rows[0].role || roleTitle;
    }

    // Clean role name
    roleTitle = roleTitle.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || 'Software Engineer';

    res.json({
      success: true,
      username: user.username,
      role: roleTitle,
      skills,
      skillsMastered: parseInt(roadmapRes.rows[0]?.count || 0),
      projectsCompleted: parseInt(projectRes.rows[0]?.count || 0),
      streak: parseInt(streakRes.rows[0]?.current_streak || 0),
      memberSince: user.created_at,
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/visibility
// @desc    Update public visibility toggle for logged-in user
// @access  Private
router.put('/visibility', protect, async (req, res) => {
  try {
    const { isPublic } = req.body;
    await pool.query('UPDATE users SET is_public = $1 WHERE id = $2', [!!isPublic, req.user.id]);
    res.json({ success: true, isPublic: !!isPublic });
  } catch (error) {
    console.error('Error updating visibility:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
