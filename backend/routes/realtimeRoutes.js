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

// ─── Helper: fetch the full dashboard snapshot from PostgreSQL ────────────────
async function getUserDashboardData(userId) {
  const [projResult, xpResult] = await Promise.all([
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
  ]);

  const projects = projResult.rows.map(p => ({
    ...p,
    project_data:  typeof p.project_data  === 'string' ? JSON.parse(p.project_data)  : p.project_data,
    progress_data: typeof p.progress_data === 'string' ? JSON.parse(p.progress_data) : p.progress_data,
  }));

  return {
    projects,
    totalXP:        parseInt(xpResult.rows[0]?.total_xp || 0, 10),
    activeCount:    projects.filter(p => p.status === 'active').length,
    completedCount: projects.filter(p => p.status === 'completed').length,
    savedCount:     projects.filter(p => p.status === 'saved').length,
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
