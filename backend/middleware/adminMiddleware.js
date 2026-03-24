const pool = require('../config/db');

const ADMIN_EMAIL = 'supportfindstreak@tekadvo.com';

const adminOnly = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query('SELECT email, is_admin FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'User not found' });

    // Allow access if email matches admin email OR is_admin flag is set
    if (user.email === ADMIN_EMAIL || user.is_admin === true) {
      return next();
    }

    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { adminOnly };
