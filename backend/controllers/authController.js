const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: 'error', message: 'Verification token is required' });
  }

  try {
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

const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be username or email

  if (!identifier || !password) {
    return res.status(400).json({ status: 'error', message: 'Please provide username/email and password' });
  }

  try {
    // Check for user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [identifier]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check verification status
    if (!user.is_verified) {
      return res.status(401).json({ status: 'error', message: 'Please verify your email before logging in' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret', // Use env var in production!
      { expiresIn: '30d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser
};
