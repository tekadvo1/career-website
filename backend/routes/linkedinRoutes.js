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
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36' },
          timeout: 5000
        });
        const $ = cheerio.load(response.data);
        const title = $('title').text() || '';
        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
        
        // If LinkedIn throws an auth wall, the title usually contains "Log In" or "Sign Up"
        if (title.toLowerCase().includes('log in') || title.toLowerCase().includes('sign in')) {
          profileText = `[SYSTEM NOTE: LinkedIn actively blocked access to the user's URL (${originalUrl}). NO PROFILE DATA WAS SCRAPED.]`;
        } else {
          profileText = `LinkedIn URL: ${originalUrl}\nExtracted Title / Headline: ${title}\nExtracted About / Summary: ${metaDesc}\n\n(Note: Full page content might be hidden behind LinkedIn privacy walls, analyze heavily based on this summary and the resume if provided.)`;
        }
      } catch (e) {
        console.warn('Scraping failed (LinkedIn blocked), using URL as pure AI prompt:', e.message);
        profileText = `[SYSTEM NOTE: LinkedIn actively blocked access to the user's URL (${originalUrl}). NO PROFILE DATA WAS SCRAPED.]`;
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

    const prompt = `
      You are a senior LinkedIn profile strategist who has helped 1,000+ professionals land jobs at top companies. You are brutally honest.

      User's Extracted Profile Content:
      ---
      ${profileText}
      ---

      ${resumeText ? `User's Uploaded Resume (USE THIS AS THE PRIMARY SOURCE OF TRUTH):
      ---
      ${resumeText}
      ---` : 'No resume provided.'}

      Your task: Perform a rigorous LinkedIn profile audit to maximize recruiter attraction.

      CRITICAL RULES:
      1. DO NOT HALLUCINATE OR INVENT FAKE PROFILES. If the Extracted Profile Content says "NO PROFILE DATA WAS SCRAPED" and there is NO resume provided, you MUST inform the user that LinkedIn blocked their URL and you need their resume, and set the overallScore to 0. Do not invent a fake "Software Engineer at Amazon."
      2. If "NO PROFILE DATA WAS SCRAPED" but they DID provide a resume, base the ENTIRE LinkedIn optimization on their resume. Write the exact perfect LinkedIn profile they should construct using their resume data.
      3. overallScore: A realistic percentage (0-100).
      4. For each section (headline, summary, experience, skills):
         - score: 1 to 10.
         - mistake: Identify the problem based ONLY on the provided text/resume.
         - correction: Write the EXACT improved version they can copy-paste.
      5. missingSkills: List 10 to 15 specific keywords they should add.
      6. resumeComparison: If a resume was provided, explain the gap between the profile (if any) and the resume. If no profile was scraped, use this to summarize what you deduced from the resume. If no resume at all, output "No resume uploaded."
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ── BULLETPROOF FIX Part 2: Dynamic Fallback Loop ──
    // The ListModels API sometimes falsely advertises models that return "404 Not Found"
    // when attempting to actually generate content. So we explicitly try them in order.
    const fallbackOrder = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-pro"
    ];

    let aiResult = null;
    let successfulModel = null;
    let lastError = null;

    for (const modelName of fallbackOrder) {
      try {
        console.log(`Attempting LinkedIn analysis with Gemini model: ${modelName}`);
        const currentModel = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: linkedinSchema,
            temperature: 0.2,
          }
        });
        
        aiResult = await currentModel.generateContent(prompt);
        successfulModel = modelName;
        console.log(`✅ Successfully generated with model: ${successfulModel}`);
        break; // Stop looping once we get a successful generation
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model ${modelName} failed (${err.message}). Trying fallback...`);
      }
    }

    if (!aiResult) {
      throw lastError || new Error("All Gemini fallback models failed.");
    }

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
    
    res.status(500).json({ error: `Gemini Error: ${error.message || 'Failed to generate analysis'}` });
  }
});

module.exports = router;
