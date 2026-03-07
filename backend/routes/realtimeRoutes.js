const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── In-memory SSE client registry ────────────────────────────────────────────
// Map<userId, Set<res>>  — supports multiple tabs per user
const clients = new Map();

function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
}

function removeClient(userId, res) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(userId);
}

// Broadcast a JSON payload to every tab for a given userId
function broadcast(userId, event, data) {
  const set = clients.get(String(userId));
  if (!set || set.size === 0) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  set.forEach(res => {
    try { res.write(msg); } catch (_) { /* client disconnected */ }
  });
}

// ─── Broadcast helper — callable from other routes ────────────────────────────
router.broadcast = broadcast;

// ─── GET /api/realtime/stream?userId=X ────────────────────────────────────────
router.get('/stream', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Register this client
  addClient(String(userId), res);

  // Send initial snapshot immediately
  try {
    const snapshot = await getUserDashboardData(userId);
    res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
  } catch (err) {
    console.error('SSE snapshot error:', err.message);
  }

  // Keep-alive ping every 25 seconds
  const ping = setInterval(() => {
    try { res.write(`: ping\n\n`); } catch (_) { clearInterval(ping); }
  }, 25000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(ping);
    removeClient(String(userId), res);
  });
});

// ─── Daily Streak Engine ──────────────────────────────────────────────────────
async function recordDailyActivity(userId) {
  try {
    const res = await pool.query('SELECT current_streak, longest_streak, last_active_date FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) return 0;
    
    const user = res.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const lastActiveObj = user.last_active_date ? new Date(user.last_active_date) : null;
    const lastActive = lastActiveObj ? lastActiveObj.toISOString().split('T')[0] : null;

    let currentStreak = user.current_streak || 0;
    let longestStreak = user.longest_streak || 0;

    if (lastActive === today) {
      return currentStreak; // Already logged in today
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (lastActive === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = 1; // Reset streak if missed a day
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await pool.query(
      'UPDATE users SET current_streak = $1, longest_streak = $2, last_active_date = $3 WHERE id = $4',
      [currentStreak, longestStreak, today, userId]
    );
    
    return currentStreak;
  } catch (err) {
    console.error('Streak update error:', err);
    return 0; // fallback
  }
}

// ─── Helper: fetch the full dashboard snapshot from PostgreSQL ────────────────
async function getUserDashboardData(userId) {
  const [projResult, xpResult, streak, roadmapResult, missionsResult, missionsXpResult] = await Promise.all([
    pool.query(
      `SELECT id, title, description, role, status, progress_data, project_data, last_updated, created_at
       FROM user_projects WHERE user_id = $1 ORDER BY last_updated DESC`,
      [userId]
    ),
    pool.query(
      `SELECT COALESCE(SUM((progress_data->>'xp')::int), 0) AS total_xp
       FROM user_projects WHERE user_id = $1`,
      [userId]
    ),
    recordDailyActivity(userId),
    pool.query(`SELECT role, topic_name FROM roadmap_progress WHERE user_id = $1`, [userId]),
    pool.query(
      `SELECT m.*, um.status, um.progress, um.xp_earned 
       FROM missions m 
       LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = $1
       ORDER BY m.difficulty, m.xp_reward`,
       [userId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(xp_earned), 0) as total_xp FROM user_missions WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    )
  ]);

  const projects = projResult.rows.map(p => ({
    ...p,
    project_data:  typeof p.project_data  === 'string' ? JSON.parse(p.project_data)  : p.project_data,
    progress_data: typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data,
  }));

  return {
    projects,
    totalXP:        parseInt(xpResult.rows[0]?.total_xp || 0, 10),
    totalStreak:    streak,
    activeCount:    projects.filter(p => p.status === 'active').length,
    completedCount: projects.filter(p => p.status === 'completed').length,
    savedCount:     projects.filter(p => p.status === 'saved').length,
    roadmapProgress: roadmapResult.rows,
    missions: missionsResult.rows,
    missionsTotalXp: parseInt(missionsXpResult.rows[0]?.total_xp || 0, 10),
    timestamp:      new Date().toISOString(),
  };
}

// ─── POST /api/realtime/notify ────────────────────────────────────────────────
// Internal endpoint — called by other routes after DB writes to push live updates
router.post('/notify', async (req, res) => {
  const { userId, event = 'refresh' } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const data = await getUserDashboardData(userId);
    broadcast(String(userId), event, data);
    res.json({ success: true, clientCount: clients.get(String(userId))?.size || 0 });
  } catch (err) {
    console.error('Notify error:', err.message);
    res.status(500).json({ error: 'Notify failed' });
  }
});

// ─── GET /api/realtime/stats ──────────────────────────────────────────────────
router.get('/stats', (_req, res) => {
  let total = 0;
  clients.forEach(set => { total += set.size; });
  res.json({ connectedUsers: clients.size, connectedTabs: total });
});

module.exports = router;
