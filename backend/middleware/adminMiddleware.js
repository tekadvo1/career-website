const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET + '_admin_secure';

/**
 * adminProtect - verifies the dedicated admin JWT token
 * Reads from Authorization: Bearer <adminToken>
 */
const adminProtect = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Admin token required' });
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Not an admin token' });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Admin session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

/**
 * adminOnly (legacy) - kept for backwards compatibility
 * Uses the same adminProtect logic
 */
const adminOnly = adminProtect;

module.exports = { adminOnly, adminProtect };
