const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const pool = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai'); // kept for future use

// Multer — resume uploads max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── 1) GET saved analysis ───────────────────────────────────────────────────
router.get('/saved', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM linkedin_analyses WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No saved analysis found' });
    }
  } catch (err) {
    console.error('DB error (saved):', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── 2) POST analyze profile ─────────────────────────────────────────────────
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { profileInput } = req.body;
    if (!profileInput) {
      return res.status(400).json({ error: 'LinkedIn profile URL or text is required.' });
    }

    // ── Extract profile text from URL ──
    let profileText = profileInput;
    let originalUrl = null;

    if (profileInput.trim().startsWith('http')) {
      originalUrl = profileInput.trim();
      try {
        const response = await axios.get(originalUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
          timeout: 6000
        });
        const $ = cheerio.load(response.data);
        const title   = $('title').text() || '';
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        profileText = `URL: ${originalUrl}\n\nPage Title: ${title}\n\nMeta Description: ${metaDesc}\n\nVisible Text: ${$('body').text().substring(0, 3000)}`;
      } catch (e) {
        console.warn('LinkedIn scrape blocked — using URL as context:', e.message);
        profileText = `LinkedIn profile URL provided: ${originalUrl}. LinkedIn blocks direct scraping. Analyze based on the URL username/path for any inferable context, and give rigorous professional advice for every LinkedIn section as if you were auditing a real profile in this professional's industry.`;
      }
    }

    // ── Extract resume text ──
    let resumeText = '';
    let fileName = null;
    if (req.file) {
      fileName = req.file.originalname;
      const ext = fileName.split('.').pop().toLowerCase();
      try {
        if (ext === 'pdf') {
          const data = await pdf(req.file.buffer);
          resumeText = data.text;
        } else if (ext === 'doc' || ext === 'docx') {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          resumeText = result.value;
        } else {
          return res.status(400).json({ error: 'Unsupported file format. Use PDF or DOCX.' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Failed to read resume file.' });
      }
    }

    // ── Gemini API key check ──
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured. Add GEMINI_API_KEY to Railway environment variables.' });
    }

    // ── Use OpenAI SDK with Google's OpenAI-compatible endpoint ──
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    const prompt = `
You are a senior LinkedIn profile strategist who has helped 1,000+ professionals land jobs at FAANG, startups, and Fortune 500 companies. You are brutally honest and always provide highly specific, copy-paste-ready advice.

User's LinkedIn Profile Content:
---
${profileText}
---

${resumeText
  ? `User's Resume Content — cross-reference carefully:
---
${resumeText}
---`
  : 'No resume provided. Perform a standalone LinkedIn profile analysis.'}

Your task: Perform a rigorous LinkedIn profile audit to maximize recruiter attraction.

Rules:
1. overallScore: A realistic percentage 0–100. Most profiles score 35–65.
2. For each section (headline, summary, experience, skills):
   - score: 1 to 10. Be critical.
   - mistake: The SPECIFIC problem. Reference actual content where possible.
   - correction: Write the EXACT improved version they can copy-paste NOW.
     - Headline: Powerful 220-char headline: [Title] | [Value Prop] | [Keywords]
     - Summary: Compelling 3-paragraph About section in first person (hook → achievements → CTA)
     - Experience: Rewrite 2–3 bullet points with strong action verbs + quantified impact
     - Skills: 4–5 specific actionable tips (reordering, endorsements, pinning key skills)
3. missingSkills: 10–15 specific high-demand keywords/tools recruiters search for that are NOT visible on the profile.
4. resumeComparison: If resume provided, name SPECIFIC achievements, certifications, metrics, and tools from the resume missing from LinkedIn. If no resume: "No resume uploaded."

IMPORTANT: You MUST respond with ONLY valid JSON in exactly this structure, no extra text:
{
  "overallScore": <integer 0-100>,
  "headline": { "score": <integer 1-10>, "mistake": "<string>", "correction": "<string>" },
  "summary":  { "score": <integer 1-10>, "mistake": "<string>", "correction": "<string>" },
  "experience":{ "score": <integer 1-10>, "mistake": "<string>", "correction": "<string>" },
  "skills":   { "score": <integer 1-10>, "mistake": "<string>", "correction": "<string>", "missingSkills": ["<string>"] },
  "resumeComparison": "<string>"
}
`;

    // ── Direct Gemini REST API (most reliable — no SDK naming issues) ──
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      },
      { timeout: 60000 }
    );

    const jsonStr = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonStr) throw new Error('Empty response from Gemini API.');
    const parsedData = JSON.parse(jsonStr);

    // ── Validate required keys exist ──
    const required = ['overallScore', 'headline', 'summary', 'experience', 'skills'];
    for (const key of required) {
      if (!(key in parsedData)) throw new Error(`AI response missing required field: ${key}`);
    }

    // ── Save to DB (UPSERT) ──
    await pool.query(
      `INSERT INTO linkedin_analyses (user_id, profile_url, resume_filename, analysis_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         profile_url     = EXCLUDED.profile_url,
         resume_filename = EXCLUDED.resume_filename,
         analysis_data   = EXCLUDED.analysis_data,
         created_at      = CURRENT_TIMESTAMP`,
      [req.user.id, originalUrl, fileName, JSON.stringify(parsedData)]
    );

    res.json({ analysis: parsedData, fileName, profileUrl: originalUrl });

  } catch (error) {
    const geminiErr = error?.response?.data?.error;
    const msg = geminiErr
      ? `Gemini API Error [${geminiErr.code}]: ${geminiErr.message}`
      : error?.message || 'Failed to generate analysis.';
    console.error('LinkedIn Analysis Error:', msg);
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
