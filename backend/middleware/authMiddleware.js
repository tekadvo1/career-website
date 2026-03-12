const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from the token including full profile
      const result = await pool.query(
        'SELECT id, username, email, is_verified, onboarding_completed, is_public, bio, phone, location, country_code, avatar, custom_skills FROM users WHERE id = $1', 
        [decoded.id]
      );
      
      if (result.rows.length === 0) {
          return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
      }

      req.user = result.rows[0];
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
