const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const pool = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');

// Setting up multer for resume uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const linkedinSchema = {
  type: "object",
  properties: {
    overallScore: { type: "integer", description: "Total percentage score of the profile out of 100" },
    headline: {
      type: "object",
      properties: { score: { type: "integer", description: "1 to 10" }, mistake: { type: "string" }, correction: { type: "string" } },
      required: ["score", "mistake", "correction"],
      additionalProperties: false
    },
    summary: {
      type: "object",
      properties: { score: { type: "integer" }, mistake: { type: "string" }, correction: { type: "string" } },
      required: ["score", "mistake", "correction"],
      additionalProperties: false
    },
    experience: {
      type: "object",
      properties: { score: { type: "integer" }, mistake: { type: "string" }, correction: { type: "string" } },
      required: ["score", "mistake", "correction"],
      additionalProperties: false
    },
    skills: {
      type: "object",
      properties: {
        score: { type: "integer" },
        mistake: { type: "string" },
        correction: { type: "string" },
        missingSkills: { type: "array", items: { type: "string" } }
      },
      required: ["score", "mistake", "correction", "missingSkills"],
      additionalProperties: false
    },
    resumeComparison: { type: "string", description: "Comparison if resume exists" }
  },
  required: ["overallScore", "headline", "summary", "experience", "skills", "resumeComparison"],
  additionalProperties: false
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

    let profileText = '';
    let originalUrl = null;

    // ── 1. PROXYCURL LINKEDIN URL SCRAPING (Like Resume Worded) ──
    // This is the correct API to extract real data from a LinkedIn URL.
    if (profileInput.trim().startsWith('http')) {
      originalUrl = profileInput.trim();
      const proxycurlKey = process.env.PROXYCURL_API_KEY?.trim();
      
      if (proxycurlKey) {
        try {
          console.log("Fetching LinkedIn data via Proxycurl...");
          const response = await axios.get(`https://nubela.co/proxycurl/api/v2/linkedin`, {
            params: { url: originalUrl, use_cache: 'if-present' },
            headers: { 'Authorization': `Bearer ${proxycurlKey}` }
          });
          
          const p = response.data;
          profileText = `
            Name: ${p.full_name}
            Headline: ${p.headline}
            Summary: ${p.summary}
            Experiences: ${p.experiences?.map(e => `${e.title} at ${e.company} (${e.starts_at?.year} - ${e.ends_at?.year || 'Present'}): ${e.description}`).join(' | ')}
            Education: ${p.education?.map(edu => `${edu.degree_name} at ${edu.school}`).join(' | ')}
          `;
        } catch (err) {
          console.warn("Proxycurl failed:", err.message);
          profileText = `[LinkedIn data extraction failed. Please check Proxycurl API limit or upload Resume.]`;
        }
      } else {
        // Fallback if no Proxycurl API key is provided
        profileText = `[SYSTEM NOTE: To extract data directly from a LinkedIn URL without being blocked, you must set PROXYCURL_API_KEY in your environment. Currently, no valid data was scraped.]`;
      }
    } else {
      profileText = profileInput; // PURE TEXT PASTE
    }

    // ── 2. PROCESS RESUME ──
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

    // ── 3. AI GENERATION (OPENAI) ──
    const openAIApiKey = process.env.OPENAI_API_KEY?.trim();
    if (!openAIApiKey) {
      return res.status(500).json({ error: 'OpenAI API key missing. Please set OPENAI_API_KEY in Railway.' });
    }

    const openai = new OpenAI({ apiKey: openAIApiKey });

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
      1. DO NOT HALLUCINATE OR INVENT FAKE PROFILES. If the Extracted Profile Content says "no valid data was scraped" and there is NO resume provided, you MUST inform the user they need to configure their scraping API or upload a resume, and set the overallScore to 0. Do not invent a fake "Software Engineer at Amazon."
      2. If you only have a resume, base the ENTIRE LinkedIn optimization on their resume. Write the exact perfect LinkedIn profile they should construct using their resume data.
      3. overallScore: A realistic percentage (0-100).
      4. For each section (headline, summary, experience, skills):
         - score: 1 to 10.
         - mistake: Identify the problem based ONLY on the provided text/resume.
         - correction: Write the EXACT improved version they can copy-paste.
      5. missingSkills: List 10 to 15 specific keywords they should add.
      6. resumeComparison: If a resume was provided, explain the gap between the profile (if any) and the resume. If no profile was scraped, use this to summarize what you deduced from the resume. If no resume at all, output "No resume uploaded."
    `;

    console.log("Generating analysis via OpenAI (gpt-4o-mini)...");
    
    // We use GPT-4o-mini as it is universally reliable and lightning fast.
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "linkedin_analysis",
          schema: linkedinSchema
        }
      }
    });

    const aiResultStr = aiResponse.choices[0].message.content;
    const parsedData = JSON.parse(aiResultStr);

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
