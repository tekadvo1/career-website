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
  passport.authenticate('google', { failureRedirect: '/signin', session: false }), 
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
    let workspaceRole = req.query.workspace;
    // Convert slug format back to username: "rakesh-vejendla33" → "rakesh vejendla33"
    const usernameFromSlug = username.replace(/-/g, ' ');

    // Step 1: exact match on raw username
    let userRes = await pool.query(
      'SELECT id, username, email, created_at, is_public, bio, phone, location, country_code, avatar FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    // Step 2: try slug-decoded version ("rakesh-vejendla33" → "rakesh vejendla33")
    if (userRes.rows.length === 0 && usernameFromSlug !== username) {
      userRes = await pool.query(
        'SELECT id, username, email, created_at, is_public, bio, phone, location, country_code, avatar FROM users WHERE LOWER(username) = LOWER($1)',
        [usernameFromSlug]
      );
    }

    // Step 3: prefix match fallback (handles any suffix like numbers)
    if (userRes.rows.length === 0) {
      userRes = await pool.query(
        'SELECT id, username, email, created_at, is_public, bio, phone, location, country_code, avatar FROM users WHERE LOWER(username) LIKE LOWER($1) ORDER BY created_at DESC LIMIT 1',
        [`${usernameFromSlug}%`]
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
    // Step 4: Get their active workspace role (either from query or most recent)
    if (!workspaceRole) {
      const wsRes = await pool.query(
        'SELECT role FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
      if (wsRes.rows.length > 0) {
        workspaceRole = wsRes.rows[0].role;
      }
    }

    // Get their most recent role analysis for this specific role
    let roleRes;
    if (workspaceRole) {
      const queryRole = workspaceRole.replace(/-/g, ' ').toLowerCase();
      // Try exact or prefix match first
      roleRes = await pool.query(
        'SELECT role_title, analysis_data FROM role_analyses WHERE user_id = $1 AND (LOWER(role_title) = $2 OR LOWER(role_title) LIKE $3) ORDER BY created_at DESC LIMIT 1',
        [user.id, queryRole, `${queryRole}%`]
      );
      
      // If still not found, try a broader keyword match
      if (roleRes.rows.length === 0) {
        roleRes = await pool.query(
          'SELECT role_title, analysis_data FROM role_analyses WHERE user_id = $1 AND LOWER(role_title) LIKE $2 ORDER BY created_at DESC LIMIT 1',
          [user.id, `%${queryRole}%`]
        );
      }
    }
    
    // Fallback if not found - ONLY if no specific workspace was requested
    if (!workspaceRole && (!roleRes || roleRes.rows.length === 0)) {
      roleRes = await pool.query(
        'SELECT role_title, analysis_data FROM role_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
    }

    // Get their active workspace role
    const wsRes = await pool.query(
      'SELECT role FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    // We need the role first to query the counts accurately
    let roleTitle = (workspaceRole ? workspaceRole.replace(/-/g, ' ') : null) || (wsRes.rows.length > 0 ? wsRes.rows[0].role : 'Software Engineer');
    let skills = [];

    // Step 5: Extract skills from matched analysis
    const getSkillsFromAnalysis = (analysisData) => {
      const analysis = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData;
      if (!analysis) return [];
      
      let rawSkills = [];
      if (analysis.technicalSkills && Array.isArray(analysis.technicalSkills)) {
        rawSkills = analysis.technicalSkills;
      } else if (analysis.skills && Array.isArray(analysis.skills)) {
        rawSkills = analysis.skills.map(s => typeof s === 'string' ? s : (s.name || s.skill));
      } else if (analysis.existingSkills && Array.isArray(analysis.existingSkills)) {
        rawSkills = analysis.existingSkills.map(s => typeof s === 'string' ? s : (s.name || s.skill));
      }
      return rawSkills.filter(Boolean).slice(0, 5);
    };

    if (roleRes && roleRes.rows.length > 0) {
      // Use the analysis title if we don't have a more specific one
      if (!roleTitle || roleTitle === 'Software Engineer') {
        roleTitle = roleRes.rows[0].role_title || roleTitle;
      }
      skills = getSkillsFromAnalysis(roleRes.rows[0].analysis_data);
    }

    // Step 6: If no skills found yet, try extracting from roadmap progress or projects for THIS role
    if (skills.length === 0) {
      const projectSkillsRes = await pool.query(
        "SELECT project_data FROM user_projects WHERE user_id = $1 AND LOWER(role) = LOWER($2) LIMIT 10",
        [user.id, roleTitle]
      );
      
      const projectSkills = new Set();
      projectSkillsRes.rows.forEach(row => {
        const data = typeof row.project_data === 'string' ? JSON.parse(row.project_data) : row.project_data;
        if (data?.skills_impact) {
          data.skills_impact.forEach(s => projectSkills.add(s.skill || s.name));
        }
      });
      
      if (projectSkills.size > 0) {
        skills = Array.from(projectSkills).slice(0, 5);
      }
    }

    // Fallback: Default skills based on role name keywords if still empty
    if (skills.length === 0) {
      const rt = roleTitle.toLowerCase();
      if (rt.includes('mainframe') || rt.includes('cobol')) {
        skills = ['COBOL', 'JCL', 'DB2', 'Mainframe', 'z/OS'];
      } else if (rt.includes('java')) {
        skills = ['Java', 'Spring Boot', 'Hibernate', 'Maven', 'MySQL'];
      } else if (rt.includes('python')) {
        skills = ['Python', 'Django', 'Flask', 'Pandas', 'NumPy'];
      } else {
        skills = ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];
      }
    }

    // Get roadmap progress count specifically for this role
    const roadmapRes = await pool.query(
      'SELECT topic_name, completed_at FROM roadmap_progress WHERE user_id = $1 AND LOWER(role) = LOWER($2) ORDER BY completed_at DESC',
      [user.id, roleTitle]
    );

    // Get completed projects count for this role
    const projectRes = await pool.query(
      "SELECT title, status, created_at FROM user_projects WHERE user_id = $1 AND LOWER(role) = LOWER($2) ORDER BY created_at DESC",
      [user.id, roleTitle]
    );

    const completedProjects = projectRes.rows.filter(p => p.status === 'completed' || p.status === 'done');
    const inProgressProjects = projectRes.rows.filter(p => p.status !== 'completed' && p.status !== 'done');
    const activeProjectName = inProgressProjects.length > 0 ? inProgressProjects[0].title : 'No Active Project';

    // Get streak from users table
    const streakRes = await pool.query(
      'SELECT current_streak FROM users WHERE id = $1',
      [user.id]
    );

    const currentStreak = parseInt(streakRes.rows[0]?.current_streak || 0);

    // Build timeline for public profile
    let timeline = [];

    if (currentStreak > 0) {
      timeline.push({ action: "Achieved", item: `${currentStreak}-Day Daily Tasks Streak`, date: "Today", icon: "Sparkles", ts: Date.now() - 20000 });
    }

    projectRes.rows.forEach(p => {
      const isCompleted = p.status === 'completed' || p.status === 'done';
      timeline.push({
        action: isCompleted ? "Completed Project" : "Working on",
        item: p.title,
        date: isCompleted ? new Date(p.created_at || Date.now()).toLocaleDateString() : 'Currently',
        icon: isCompleted ? "Trophy" : "Activity",
        ts: new Date(p.created_at || Date.now()).getTime()
      });
    });

    roadmapRes.rows.slice(0, 10).forEach(r => {
      timeline.push({
        action: "Mastered",
        item: `Topic: ${r.topic_name}`,
        date: new Date(r.completed_at || Date.now()).toLocaleDateString(),
        icon: "Target",
        ts: new Date(r.completed_at || Date.now()).getTime()
      });
    });
    
    // Final clean of the roleTitle for display
    const optimizedRoleTitle = roleTitle.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || 'Software Engineer';
    timeline.push({ action: "Started", item: `Career Path setup as ${optimizedRoleTitle}`, date: "Recently", icon: "Code", ts: 0 });

    timeline.sort((a,b) => b.ts - a.ts);

    res.json({
      success: true,
      username: user.username,
      email: user.email,
      role: optimizedRoleTitle,
      skills,
      skillsMastered: roadmapRes.rows.length,
      projectsCompleted: completedProjects.length,
      totalProjects: projectRes.rows.length || 1,
      currentProjectName: activeProjectName,
      streak: currentStreak,
      memberSince: user.created_at,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      countryCode: user.country_code,
      avatar: user.avatar,
      timeline: timeline.slice(0, 5)
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

// @route   PUT /api/auth/profile
// @desc    Update profile details for logged-in user
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, phone, location, countryCode, avatar, customSkills } = req.body;
    // Ensure custom_skills column exists (safe to run every time — idempotent)
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='custom_skills') THEN
          ALTER TABLE users ADD COLUMN custom_skills JSONB DEFAULT '[]';
        END IF;
      END $$;
    `).catch(() => {}); // Ignore if already exists or permission issue

    await pool.query(
      'UPDATE users SET bio = $1, phone = $2, location = $3, country_code = $4, avatar = $5, custom_skills = $6 WHERE id = $7',
      [bio, phone, location, countryCode, avatar, JSON.stringify(customSkills || []), req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
