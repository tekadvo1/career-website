const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// ── Mailer setup ──────────────────────────────────────────────────
const ADMIN_EMAIL = 'supportfindstreak@tekadvo.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAdminEmail = async (subject, html) => {
  try {
    await transporter.sendMail({
      from: `"FindStreak Admin" <${process.env.EMAIL_USER || ADMIN_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('Admin email send error:', err.message);
  }
};

// ── GET /api/admin/stats ─ Overview metrics ───────────────────────
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const newToday = await pool.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '1 day'");
    const newWeek = await pool.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'");
    const newMonth = await pool.query("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days'");
    const totalRoadmaps = await pool.query('SELECT COUNT(*) FROM role_analyses');
    const totalProjects = await pool.query('SELECT COUNT(*) FROM user_projects');
    const totalQuiz = await pool.query('SELECT COUNT(*) FROM quiz_results');
    const totalChats = await pool.query('SELECT COUNT(*) FROM chat_sessions');
    const totalFeedback = await pool.query('SELECT COUNT(*) FROM feedback').catch(() => ({ rows: [{ count: 0 }] }));
    const onboardedUsers = await pool.query("SELECT COUNT(*) FROM users WHERE onboarding_completed = TRUE");
    const creditsUsed = await pool.query('SELECT COALESCE(SUM(20 - COALESCE(ai_credits, 20)), 0) as used FROM users');

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        newToday: parseInt(newToday.rows[0].count),
        newWeek: parseInt(newWeek.rows[0].count),
        newMonth: parseInt(newMonth.rows[0].count),
        totalRoadmaps: parseInt(totalRoadmaps.rows[0].count),
        totalProjects: parseInt(totalProjects.rows[0].count),
        totalQuiz: parseInt(totalQuiz.rows[0].count),
        totalChats: parseInt(totalChats.rows[0].count),
        totalFeedback: parseInt(totalFeedback.rows[0].count || 0),
        onboardedUsers: parseInt(onboardedUsers.rows[0].count),
        creditsUsed: parseInt(creditsUsed.rows[0].used || 0),
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /api/admin/signup-trends ─ Signups over last 30 days ───────
router.get('/signup-trends', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json({ success: true, trends: result.rows });
  } catch (err) {
    console.error('Signup trends error:', err);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// ── GET /api/admin/top-roles ─ Most chosen roles ──────────────────
router.get('/top-roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT SPLIT_PART(LOWER(role_title), ' (', 1) as role, COUNT(*) as count
      FROM role_analyses
      GROUP BY SPLIT_PART(LOWER(role_title), ' (', 1)
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json({ success: true, roles: result.rows });
  } catch (err) {
    console.error('Top roles error:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// ── GET /api/admin/users ─ Full user table ────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        u.id, u.username, u.email, u.created_at, u.onboarding_completed,
        u.location, u.current_streak, u.ai_credits, u.is_admin, u.avatar,
        u.last_active_date,
        (SELECT role FROM workspaces WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as current_role,
        (SELECT COUNT(*) FROM user_projects WHERE user_id = u.id) as project_count,
        (SELECT COUNT(*) FROM roadmap_progress WHERE user_id = u.id) as topics_done,
        (SELECT COUNT(*) FROM quiz_results WHERE user_id = u.id) as quiz_count,
        (SELECT COUNT(*) FROM chat_sessions WHERE user_id = u.id) as chat_count,
        (SELECT COALESCE(SUM(xp_earned), 0) FROM user_missions WHERE user_id = u.id AND status = 'completed') as total_xp
      FROM users u
    `;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE u.email ILIKE $1 OR u.username ILIKE $1`;
    }
    query += ` ORDER BY u.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const countQuery = search
      ? `SELECT COUNT(*) FROM users WHERE email ILIKE $1 OR username ILIKE $1`
      : `SELECT COUNT(*) FROM users`;

    const usersRes = await pool.query(query, params);
    const total = await pool.query(countQuery, search ? [`%${search}%`] : []);
    const users = usersRes;

    res.json({
      success: true,
      users: users.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(parseInt(total.rows[0].count) / parseInt(limit))
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── GET /api/admin/user/:id ─ Single user deep profile ────────────
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const projects = await pool.query("SELECT id, title, status, role, created_at FROM user_projects WHERE user_id = $1 ORDER BY created_at DESC", [id]);
    const roadmap = await pool.query("SELECT role, topic_name, completed_at FROM roadmap_progress WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 20", [id]);
    const quizzes = await pool.query("SELECT role, score, total_questions, completed_at FROM quiz_results WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 10", [id]);
    const achievements = await pool.query("SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1", [id]);
    const chats = await pool.query("SELECT id, title, role, updated_at FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 5", [id]);

    if (!user.rows[0]) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: user.rows[0],
      projects: projects.rows,
      roadmapProgress: roadmap.rows,
      quizzes: quizzes.rows,
      achievements: achievements.rows,
      chatSessions: chats.rows,
    });
  } catch (err) {
    console.error('Admin user detail error:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// ── PATCH /api/admin/user/:id/credits ─ Adjust AI credits ─────────
router.patch('/user/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;
    await pool.query('UPDATE users SET ai_credits = $1 WHERE id = $2', [parseInt(credits), id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// ── DELETE /api/admin/user/:id ─ Delete a user ────────────────────
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await pool.query('SELECT email, username FROM users WHERE id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    if (userRes.rows[0]) {
      await sendAdminEmail(
        `[FindStreak] User Deleted: ${userRes.rows[0].email}`,
        `<p>Admin deleted user <strong>${userRes.rows[0].username}</strong> (${userRes.rows[0].email})</p>`
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── POST /api/admin/email-user ─ Send email to a user ─────────────
router.post('/email-user', async (req, res) => {
  try {
    const { toEmail, subject, message } = req.body;
    await transporter.sendMail({
      from: `"FindStreak Team" <${process.env.EMAIL_USER || ADMIN_EMAIL}>`,
      to: toEmail,
      subject: subject || 'Message from FindStreak',
      html: `<div style="font-family:sans-serif;padding:20px"><p>${message}</p><br/><small>— FindStreak Team</small></div>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Email user error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ── POST /api/admin/broadcast ─ Send email to ALL users ───────────
router.post('/broadcast', async (req, res) => {
  try {
    const { subject, message } = req.body;
    const usersRes = await pool.query("SELECT email FROM users WHERE is_verified = TRUE OR is_verified IS NULL");

    const emails = usersRes.rows.map(r => r.email).filter(Boolean);

    // Send in batches of 50
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await transporter.sendMail({
        from: `"FindStreak Team" <${process.env.EMAIL_USER || ADMIN_EMAIL}>`,
        bcc: batch,
        subject: subject || 'Important Message from FindStreak',
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:30px;background:#f8fafc;border-radius:12px"><div style="background:linear-gradient(135deg,#059669,#0d9488);padding:20px;border-radius:8px;text-align:center;margin-bottom:20px"><h2 style="color:white;margin:0">FindStreak</h2></div><p style="color:#334155;font-size:15px;line-height:1.6">${message}</p><br/><small style="color:#94a3b8">—The FindStreak Team · <a href="https://findstreak.com">findstreak.com</a></small></div>`,
      });
    }

    res.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// ── GET /api/admin/feedback ─ All feedback/bug reports ────────────
router.get('/feedback', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, u.username, u.email as user_email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT 100
    `).catch(async () => {
      // Table may not exist yet
      return { rows: [] };
    });
    res.json({ success: true, feedback: result.rows });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ── PATCH /api/admin/feedback/:id ─ Update feedback status ────────
router.patch('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE feedback SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// ── GET /api/admin/activity ─ Recent platform activity ────────────
router.get('/activity', async (req, res) => {
  try {
    const newUsers = await pool.query("SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5");
    const recentProjects = await pool.query("SELECT up.title, up.role, u.username, up.created_at FROM user_projects up JOIN users u ON up.user_id = u.id ORDER BY up.created_at DESC LIMIT 5");
    const recentProgress = await pool.query("SELECT rp.topic_name, rp.role, u.username, rp.completed_at FROM roadmap_progress rp JOIN users u ON rp.user_id = u.id ORDER BY rp.completed_at DESC LIMIT 5");
    const recentFeedback = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5").catch(() => ({ rows: [] }));

    const feed = [
      ...newUsers.rows.map(r => ({ type: 'signup', text: `${r.username} signed up`, time: r.created_at })),
      ...recentProjects.rows.map(r => ({ type: 'project', text: `${r.username} started "${r.title}"`, time: r.created_at })),
      ...recentProgress.rows.map(r => ({ type: 'roadmap', text: `${r.username} completed topic "${r.topic_name}"`, time: r.completed_at })),
      ...recentFeedback.rows.map(r => ({ type: 'feedback', text: `New feedback received`, time: r.created_at })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20);

    res.json({ success: true, activity: feed });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ── GET /api/admin/health ─ System health check ───────────────────
router.get('/system-health', async (req, res) => {
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    res.json({
      success: true,
      health: {
        uptime: Math.floor(process.uptime()),
        dbLatency,
        dbStatus: 'healthy',
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
      }
    });
  } catch (err) {
    res.json({
      success: true,
      health: {
        uptime: Math.floor(process.uptime()),
        dbStatus: 'error',
        dbLatency: -1,
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
      }
    });
  }
});

// ── GET /api/admin/maintenance ─ Get maintenance status ───────────
router.get('/maintenance', async (req, res) => {
  try {
    const result = await pool.query("SELECT setting_value FROM sys_maintenance_config WHERE setting_key = 'maintenance_mode'");
    res.json({ success: true, maintenance: result.rows[0]?.setting_value || { active: false, message: '' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance mode' });
  }
});

// ── PATCH /api/admin/maintenance ─ Update maintenance status ────────
router.patch('/maintenance', async (req, res) => {
  try {
    const { active, message } = req.body;
    await pool.query(
      `INSERT INTO sys_maintenance_config (setting_key, setting_value) 
       VALUES ('maintenance_mode', $1) 
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1`,
      [JSON.stringify({ active, message })]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Maintenance error:', err);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
});

// ── POST /api/admin/notify-admin ─ Trigger admin email alert ──────
router.post('/notify-admin', async (req, res) => {
  try {
    const { subject, message } = req.body;
    await sendAdminEmail(subject || '[FindStreak Alert]', `<p>${message}</p>`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

// ── GET /api/admin/top-users ─ Most active users ──────────────────
router.get('/top-users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id, u.username, u.email, u.current_streak, u.ai_credits,
        u.onboarding_completed, u.created_at,
        (SELECT COUNT(*) FROM user_projects WHERE user_id = u.id) as project_count,
        (SELECT COUNT(*) FROM roadmap_progress WHERE user_id = u.id) as topics_done,
        (SELECT COALESCE(SUM(xp_earned), 0) FROM user_missions WHERE user_id = u.id AND status = 'completed') as total_xp
      FROM users u
      ORDER BY u.current_streak DESC, total_xp DESC, project_count DESC
      LIMIT 10
    `);
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('Top users error:', err);
    res.status(500).json({ error: 'Failed to fetch top users' });
  }
});

// ── GET /api/admin/platform-summary ─ KPIs and growth ────────────
router.get('/platform-summary', async (req, res) => {
  try {
    const avgStreak = await pool.query('SELECT ROUND(AVG(current_streak),1) as avg FROM users');
    const avgCredits = await pool.query('SELECT ROUND(AVG(ai_credits),0) as avg FROM users');
    const streakUsers = await pool.query("SELECT COUNT(*) FROM users WHERE current_streak > 0");
    const topCountries = await pool.query(`SELECT COALESCE(location, 'Unknown') as country, COUNT(*) as count FROM users GROUP BY location ORDER BY count DESC LIMIT 5`);
    const recentLogins = await pool.query(`SELECT username, email, last_active_date FROM users WHERE last_active_date IS NOT NULL ORDER BY last_active_date DESC LIMIT 6`);

    res.json({
      success: true,
      summary: {
        avgStreak: parseFloat(avgStreak.rows[0].avg || 0),
        avgCredits: parseInt(avgCredits.rows[0].avg || 0),
        activeStreakUsers: parseInt(streakUsers.rows[0].count || 0),
        topCountries: topCountries.rows,
        recentLogins: recentLogins.rows,
      }
    });
  } catch (err) {
    console.error('Platform summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ── GET /api/admin/export-users ─ CSV export ──────────────────────
router.get('/export-users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.created_at, u.onboarding_completed,
        u.current_streak, u.ai_credits, u.location,
        (SELECT COUNT(*) FROM user_projects WHERE user_id = u.id) as projects,
        (SELECT COUNT(*) FROM roadmap_progress WHERE user_id = u.id) as topics_done
      FROM users u ORDER BY u.created_at DESC
    `);

    const header = 'ID,Username,Email,Joined,Onboarded,Streak,AI Credits,Location,Projects,Topics Done\n';
    const rows = result.rows.map(r =>
      `${r.id},"${r.username}","${r.email}","${new Date(r.created_at).toISOString()}",${r.onboarding_completed},${r.current_streak},${r.ai_credits},"${r.location || ''}",${r.projects},${r.topics_done}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="findstreak-users-${Date.now()}.csv"`);
    res.send(header + rows);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
module.exports.sendAdminEmail = sendAdminEmail;
