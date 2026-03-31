const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const pool = require('../db');
const { requireAuth } = require('../middlewares/auth');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Setting up multer for resume uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '');

const linkedinSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallScore: { type: SchemaType.INTEGER, description: "Total percentage score of the profile out of 100" },
    headline: {
      type: SchemaType.OBJECT,
      properties: { score: { type: SchemaType.INTEGER, description: "1 to 10" }, mistake: { type: SchemaType.STRING }, correction: { type: SchemaType.STRING } },
      required: ["score", "mistake", "correction"]
    },
    summary: {
      type: SchemaType.OBJECT,
      properties: { score: { type: SchemaType.INTEGER, description: "1 to 10" }, mistake: { type: SchemaType.STRING }, correction: { type: SchemaType.STRING } },
      required: ["score", "mistake", "correction"]
    },
    experience: {
      type: SchemaType.OBJECT,
      properties: { score: { type: SchemaType.INTEGER, description: "1 to 10" }, mistake: { type: SchemaType.STRING }, correction: { type: SchemaType.STRING } },
      required: ["score", "mistake", "correction"]
    },
    skills: {
      type: SchemaType.OBJECT,
      properties: { score: { type: SchemaType.INTEGER, description: "1 to 10" }, mistake: { type: SchemaType.STRING }, correction: { type: SchemaType.STRING }, missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } },
      required: ["score", "mistake", "correction", "missingSkills"]
    },
    resumeComparison: {
      type: SchemaType.STRING,
      description: "If a resume was uploaded, outline specifically what strengths were on the resume that they forgot to include in their LinkedIn profile."
    }
  },
  required: ["overallScore", "headline", "summary", "experience", "skills"]
};

// 1) Fetch saved analysis for user
router.get('/saved', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM linkedin_analyses WHERE user_id = $1', [req.user.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No saved analysis found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2) Analyze new profile
router.post('/analyze', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    let { profileInput } = req.body; // Can be a URL or pasted text
    if (!profileInput) return res.status(400).json({ error: 'LinkedIn profile link or text is required.' });

    let profileText = profileInput;
    let originalUrl = null;

    // If they pasted a URL, let's try to extract basic metadata
    if (profileInput.trim().startsWith('http')) {
      originalUrl = profileInput.trim();
      try {
        const response = await axios.get(originalUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
          timeout: 5000
        });
        const $ = cheerio.load(response.data);
        const title = $('title').text() || '';
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        // Often public profiles expose a bunch of basic info in these tags
        profileText = `URL: ${originalUrl}\n\nTitle: ${title}\n\nDescription: ${metaDesc}\n\nHTML Text Extract: ${$('body').text().substring(0, 3000)}`;
      } catch (e) {
        console.warn('Scraping failed (LinkedIn blocked), using URL as pure AI prompt:', e.message);
        profileText = `The user provided this LinkedIn profile URL: ${originalUrl}. Please do your best to analyze based on URL alone, or if you cannot, give generic strong advice for the components of a LinkedIn profile.`;
      }
    }

    // Process uploaded resume if any
    let resumeText = '';
    let fileName = null;
    if (req.file) {
      fileName = req.file.originalname;
      const fileExt = fileName.split('.').pop().toLowerCase();
      try {
        if (fileExt === 'pdf') {
          const data = await pdf(req.file.buffer);
          resumeText = data.text;
        } else if (fileExt === 'doc' || fileExt === 'docx') {
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          resumeText = result.value;
        } else {
          return res.status(400).json({ error: 'Unsupported file format.' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Failed to process resume file.' });
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key missing.' });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: linkedinSchema,
        temperature: 0.1,
      }
    });

    const prompt = `
      You are an expert executive LinkedIn profile optimizer and career coach.
      
      User's LinkedIn Profile Content (extracted or pasted):
      ---
      ${profileText}
      ---
      
      ${resumeText ? `User ALSO provided their internal Resume. Cross-reference this resume with their LinkedIn profile to find powerful details on the resume that they FORGOT to highlight on LinkedIn!
      ---
      ${resumeText}
      ---` : "User did NOT provide a resume. Do a standalone analysis."}
      
      Instructions:
      1. Give them an overall percentage score out of 100.
      2. For the 4 core sections (Headline, Summary, Experience, Skills), give a score from 1 to 10. Point out the exact mistake they made, and give a highly professional, corrected version they can copy-paste.
      3. If a resume was present, fill out the resumeComparison field explaining what they missed on LinkedIn that is present on their resume. If not, leave it blank or say "No resume uploaded."
    `;

    const aiResult = await model.generateContent(prompt);
    const jsonStr = aiResult.response.text();
    const parsedData = JSON.parse(jsonStr);

    // Save to DB (UPSERT)
    await pool.query(
      `INSERT INTO linkedin_analyses (user_id, profile_url, resume_filename, analysis_data) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id) 
       DO UPDATE SET profile_url = EXCLUDED.profile_url, 
                     resume_filename = EXCLUDED.resume_filename, 
                     analysis_data = EXCLUDED.analysis_data, 
                     created_at = CURRENT_TIMESTAMP`,
      [req.user.id, originalUrl, fileName, JSON.stringify(parsedData)]
    );

    res.json({ analysis: parsedData, fileName, profileUrl: originalUrl });
  } catch (error) {
    console.error('LinkedIn Analysis Error:', error);
    res.status(500).json({ error: 'Failed to generate analysis.' });
  }
});

module.exports = router;
