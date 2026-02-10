const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      status: 'success',
      data: newUser.rows[0],
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = {
  registerUser
};
