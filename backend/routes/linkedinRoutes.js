const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const pool = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Setting up multer for resume uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

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
router.get('/saved', async (req, res) => {
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
router.post('/analyze', upload.single('resume'), async (req, res) => {
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

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key missing. Please set GEMINI_API_KEY in Railway environment variables.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: linkedinSchema,
        temperature: 0.2,
      }
    });

    const prompt = `
      You are a senior LinkedIn profile strategist who has helped 1,000+ professionals land jobs at FAANG, startups, and Fortune 500 companies. You are brutally honest and always provide highly specific, copy-paste-ready advice.

      User's LinkedIn Profile Content (URL extracted or pasted text):
      ---
      ${profileText}
      ---

      ${resumeText ? `User's Resume Content — cross-reference this carefully with the LinkedIn profile:
      ---
      ${resumeText}
      ---` : 'No resume provided. Perform a standalone LinkedIn profile analysis.'}

      Your task: Perform a rigorous LinkedIn profile audit to maximize recruiter attraction.

      Rules:
      1. overallScore: A realistic percentage score from 0–100. Be critical — most profiles score between 35–65.
      2. For each section (headline, summary, experience, skills):
         - score: A score from 1 to 10. Be critical.
         - mistake: Identify the SPECIFIC problem. Reference actual content from the profile where possible. Never be generic.
         - correction: Write the EXACT improved version they can copy-paste directly into LinkedIn right now.
           - Headline: Write a powerful, keyword-rich 220-character headline using the format: [Title] | [Value Prop] | [Keywords].
           - Summary: Write a compelling 3-paragraph About section in first person that starts with a hook, highlights achievements, and ends with a call to action.
           - Experience: Rewrite 2–3 bullet points for their most recent role using strong action verbs + quantified impact (use realistic estimates if needed).
           - Skills: Give 4–5 specific actionable tips to improve their skills section (e.g., reordering, adding endorsements, pinning key skills).
      3. missingSkills: List 10–15 specific, high-demand keywords and tools that recruiters in this field actively search for, which are NOT visible on the profile. Be very industry-specific.
      4. resumeComparison: If a resume was provided, list SPECIFIC achievements, certifications, projects, metrics, and tools from the resume that are completely missing from their LinkedIn profile. Name the actual items. If no resume: respond with "No resume uploaded."

      Important: Write all corrections in first person where appropriate. Make them professional, ATS-optimized, and recruiter-friendly.
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
    const errorDetails = error?.response?.data?.error || error;
    console.error('LinkedIn Analysis Error:', errorDetails);
    
    // Check if error is specifically about the model
    if (error.message && error.message.includes('404 Not Found')) {
      return res.status(500).json({ error: 'Google AI API is taking a moment to sync your new paid billing account. Please wait 2 minutes and try again. Model: gemini-1.5-pro' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to generate analysis.' });
  }
});

module.exports = router;
