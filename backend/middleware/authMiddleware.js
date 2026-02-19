const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from the token
      const result = await pool.query('SELECT id, username, email, is_verified, onboarding_completed FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
          return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
