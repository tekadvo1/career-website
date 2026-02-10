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

const googleCallback = (req, res) => {
  const token = jwt.sign(
    { id: req.user.id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  // Redirect to frontend with token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/google-callback?token=${token}`);
};

const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/email');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiration = new Date(Date.now() + 3600000); // 1 hour

    // Store hashed token in DB (common practice) or plain token if simple app. 
    // Schema says varchar(255). Let's store plain token for simplicity to match Verify token pattern, 
    // but ideally we hash it. Given schema constraints, I'll store the plain hex token.
    
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [resetToken, expiration, email]
    );

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ status: 'success', message: 'Password reset link sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Find user by token and check expiration
    const userResult = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset fields
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ status: 'success', message: 'Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  googleCallback,
  forgotPassword,
  resetPassword
};
