const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sendVerificationEmail } = require('../utils/email');

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
    
    // Generate verification token
    const verificationToken = uuidv4();

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, is_verified, created_at',
      [username, email, hashedPassword, false, verificationToken]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      status: 'success',
      data: newUser.rows[0],
      message: 'Registration successful! Please check your email to verify your account.'
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.body; // or req.query depending on how we call it

  if (!token) {
    return res.status(400).json({ status: 'error', message: 'Verification token is required' });
  }

  try {
    // Find user by token
    const result = await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id, email, is_verified',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired verification token' });
    }

    res.json({
      status: 'success',
      message: 'Email verified successfully! You can now log in.',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  verifyEmail
};
