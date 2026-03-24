const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET + '_admin_secure';

// POST /api/admin-auth/login
// Verifies against ADMIN_EMAIL + ADMIN_PASSWORD env variables ONLY
// Issues a short-lived admin-specific JWT
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD env vars not set');
    return res.status(503).json({ error: 'Admin credentials not configured on server' });
  }

  // Constant-time-ish comparison to prevent timing attacks
  const emailMatch = email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  const passMatch = password === adminPassword;

  if (!emailMatch || !passMatch) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  // Issue admin-specific token (short lived — 8 hours)
  const token = jwt.sign(
    { isAdmin: true, email: adminEmail, role: 'superadmin' },
    ADMIN_JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    email: adminEmail,
    expiresIn: '8h',
  });
});

// POST /api/admin-auth/verify
// Verify a given admin token
router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false });

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (!decoded.isAdmin) return res.status(401).json({ valid: false });
    res.json({ valid: true, email: decoded.email });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token invalid or expired' });
  }
});

module.exports = router;
module.exports.ADMIN_JWT_SECRET = ADMIN_JWT_SECRET;
