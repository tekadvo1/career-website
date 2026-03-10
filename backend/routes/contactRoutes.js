const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../utils/email');

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const sent = await sendContactEmail({ name, email, subject, message });
    if (sent) {
      return res.json({ success: true, message: 'Your message has been sent. We will reply within 24 hours.' });
    } else {
      // Still acknowledge receipt even if email delivery failed (RESEND_API_KEY may not be set in dev)
      return res.json({ success: true, message: 'Message received. We will get back to you soon.' });
    }
  } catch (err) {
    console.error('Contact route error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
