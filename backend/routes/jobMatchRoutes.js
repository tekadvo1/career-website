const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');

const pool = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// Configure multer — memory storage, DOC/DOCX only
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are supported in Phase 1.'));
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/job-match/analyze-resume
// Accepts a .doc/.docx file, parses it, sends to OpenAI, returns matched roles
// ─────────────────────────────────────────────────────────────────────────────
router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a .doc or .docx file.' });
    }

    // Extract text from DOCX / DOC
    let resumeText = '';
    try {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value?.trim();
    } catch (err) {
      console.error('Error parsing DOCX:', err);
      return res.status(400).json({ error: 'Failed to read your resume file. Make sure it is a valid .docx file.' });
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume appears to be empty or unreadable. Please check the file.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server config error: OpenAI key missing.' });
    }

    // ── PASS 1: Full role analysis ─────────────────────────────────────────
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior technical recruiter and career advisor. Analyze resumes deeply and return precise, honest role matching data. Always return valid JSON only — no markdown, no extra text.',
          },
          {
            role: 'user',
            content: `Carefully analyze this resume and return ALL eligible job roles this person qualifies for (no limit — include every role from 50% match and above).

IMPORTANT RULES:
- Extract the EXACT total experience by reading all job titles, companies and dates mentioned in the resume. Calculate months and years precisely.
- DO NOT make up skills or experience — only use what is explicitly in the resume.
- Match percent must honestly reflect the resume evidence (do not inflate).
- Include ALL roles the person is eligible for, sorted by matchPercent descending.

For EACH role provide:
- roleName: exact professional job title
- matchPercent: integer 50-100 based ONLY on resume evidence
- demandLevel: "High" | "Medium" | "Low"
- experienceLevel: "Entry" | "Mid" | "Senior"
- whyExplanation: a detailed step-by-step explanation object with:
    {
      "overallReason": "1-2 sentences summarizing why this match %",
      "skillsMatched": [{ "skill": "React", "evidence": "Used in 3 projects mentioned in resume" }],
      "keywordsFound": ["keyword1", "keyword2"],
      "technicalStrengths": ["strength1", "strength2"],
      "experienceAlignment": "How years/level of experience aligns",
      "missingSkills": [{ "skill": "GraphQL", "impact": "Would raise match by ~5%" }],
      "steps": [
        "Step 1: ...",
        "Step 2: ...",
        "Step 3: ..."
      ]
    }

Return ONLY this valid JSON object:
{
  "candidateName": "Full name if found in resume or null",
  "totalExperienceLabel": "e.g. 3 years 6 months or 5 years",
  "totalExperienceYears": precise decimal number like 3.5 or null,
  "experienceSummary": "2-3 sentence professional summary of the candidate based on their actual resume",
  "topSkills": ["top skill 1", "top skill 2", "...up to 8"],
  "roles": [
    {
      "roleName": "",
      "matchPercent": 0,
      "demandLevel": "High",
      "experienceLevel": "Mid",
      "whyExplanation": { ... }
    }
  ]
}

Resume text:
${resumeText.substring(0, 7000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI error:', err);
      return res.status(500).json({ error: 'AI analysis failed. Please try again.' });
    }

    const data = await openaiRes.json();
    const raw = data.choices[0].message.content;

    let analysis;
    try {
      const jsonMatch = raw.match(/```json\n([\s\S]*?)\n```/) || raw.match(/```\n([\s\S]*?)\n```/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }

    // ── PASS 2: Self-verification (double-check) ──────────────────────────────
    try {
      const verifyRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a quality reviewer. Validate and correct resume analysis JSON. Return corrected JSON only, no markdown.' },
            {
              role: 'user',
              content: `Review this resume analysis against the original resume. Check:
1. Is totalExperienceYears accurate based on actual job dates in the resume?
2. Are matchPercent values honest and evidence-based?
3. Are all skills mentioned in whyExplanation actually present in the resume?
4. Fix any inaccuracies and return the corrected full JSON (same schema, no changes to schema).

Original resume (first 3000 chars): ${resumeText.substring(0, 3000)}

Analysis to verify:
${JSON.stringify(analysis, null, 2)}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      if (verifyRes.ok) {
        const vData = await verifyRes.json();
        const vRaw = vData.choices[0].message.content;
        try {
          const vMatch = vRaw.match(/```json\n([\s\S]*?)\n```/) || vRaw.match(/```\n([\s\S]*?)\n```/);
          const verified = JSON.parse(vMatch ? vMatch[1] : vRaw);
          // Only replace if verification returned a valid object with roles
          if (verified?.roles && Array.isArray(verified.roles)) {
            analysis = verified;
          }
        } catch { /* keep original if verification parse fails */ }
      }
    } catch (verifyErr) {
      console.warn('Verification pass failed (non-fatal):', verifyErr.message);
    }

    // Ensure roles are sorted by matchPercent desc
    if (analysis.roles) {
      analysis.roles.sort((a, b) => b.matchPercent - a.matchPercent);
    }

    // Cache in DB for the user
    const userId = req.user?.id;
    if (userId) {
      try {
        await pool.query(
          `INSERT INTO job_match_analyses (user_id, file_name, analysis_data, created_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (user_id) DO UPDATE
             SET file_name = EXCLUDED.file_name,
                 analysis_data = EXCLUDED.analysis_data,
                 created_at = NOW()`,
          [userId, req.file.originalname, JSON.stringify(analysis)]
        );
      } catch (dbErr) {
        // Non-fatal — just log it
        console.warn('Could not cache job match analysis:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      fileName: req.file.originalname,
      analysis,
    });
  } catch (err) {
    console.error('Job match analyze error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/job-match/search-jobs
// Searches jobs using JSearch (RapidAPI) for a given role + country
// Query: ?role=Frontend Developer&country=us&page=1
// ─────────────────────────────────────────────────────────────────────────────
router.get('/search-jobs', async (req, res) => {
  const { role, country = 'us', page = 1 } = req.query;

  if (!role) {
    return res.status(400).json({ error: 'role query param is required.' });
  }

  const countryMap = {
    us: 'United States',
    in: 'India',
    uk: 'United Kingdom',
    ca: 'Canada',
  };

  const countryLabel = countryMap[country] || 'United States';
  const query = `${role} jobs in ${countryLabel}`;

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    // Fallback: return curated job board links when no API key
    return res.json({
      success: true,
      fallback: true,
      jobs: buildFallbackLinks(role, country),
    });
  }

  try {
    const apiRes = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1&date_posted=all`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        },
      }
    );

    if (!apiRes.ok) {
      const err = await apiRes.json();
      console.error('JSearch API error:', err);
      // Fallback gracefully
      return res.json({ success: true, fallback: true, jobs: buildFallbackLinks(role, country) });
    }

    const data = await apiRes.json();
    const jobs = (data.data || []).slice(0, 15).map((j) => ({
      id: j.job_id,
      title: j.job_title,
      company: j.employer_name,
      location: `${j.job_city || ''}, ${j.job_country || ''}`.replace(/^,\s*/, '').trim(),
      employmentType: j.job_employment_type || 'Full-time',
      isRemote: j.job_is_remote || false,
      salary: j.job_min_salary && j.job_max_salary
        ? `$${Number(j.job_min_salary).toLocaleString()} – $${Number(j.job_max_salary).toLocaleString()}`
        : null,
      postedAt: j.job_posted_at_datetime_utc || null,
      applyUrl: j.job_apply_link,
      logo: j.employer_logo || null,
      description: j.job_description?.substring(0, 200) + '...' || '',
    }));

    return res.json({ success: true, fallback: false, jobs, total: data.status === 'OK' ? jobs.length : 0 });
  } catch (err) {
    console.error('JSearch fetch error:', err);
    return res.json({ success: true, fallback: true, jobs: buildFallbackLinks(role, country) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/job-match/my-analysis  — fetch cached analysis for the logged in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-analysis', async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await pool.query(
      'SELECT file_name, analysis_data, created_at FROM job_match_analyses WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, analysis: null });
    }
    const row = result.rows[0];
    return res.json({
      success: true,
      fileName: row.file_name,
      analysis: row.analysis_data,
      analyzedAt: row.created_at,
    });
  } catch (err) {
    console.error('Fetch analysis error:', err);
    return res.status(500).json({ error: 'Failed to fetch saved analysis.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function buildFallbackLinks(role, country) {
  const encoded = encodeURIComponent(role);
  const links = {
    us: [
      { id: 'linkedin-us', title: `${role} — LinkedIn`, company: 'LinkedIn Jobs', location: 'United States', applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=United+States`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Browse ${role} listings on LinkedIn in the United States.` },
      { id: 'indeed-us', title: `${role} — Indeed`, company: 'Indeed', location: 'United States', applyUrl: `https://www.indeed.com/jobs?q=${encoded}&l=United+States`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Search ${role} jobs on Indeed across the US.` },
      { id: 'usajobs', title: `${role} — USAJobs (Government)`, company: 'USAJobs.gov', location: 'United States', applyUrl: `https://www.usajobs.gov/search/results/?k=${encoded}&p=1`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Official US government job listings for ${role}.` },
    ],
    in: [
      { id: 'linkedin-in', title: `${role} — LinkedIn India`, company: 'LinkedIn Jobs', location: 'India', applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=India`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Browse ${role} listings on LinkedIn in India.` },
      { id: 'naukri', title: `${role} — Naukri.com`, company: 'Naukri', location: 'India', applyUrl: `https://www.naukri.com/${encoded.replace(/%20/g, '-')}-jobs`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Search ${role} jobs on Naukri — India's top job portal.` },
      { id: 'indeed-in', title: `${role} — Indeed India`, company: 'Indeed', location: 'India', applyUrl: `https://in.indeed.com/jobs?q=${encoded}&l=India`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Search ${role} jobs on Indeed India.` },
    ],
    uk: [
      { id: 'linkedin-uk', title: `${role} — LinkedIn UK`, company: 'LinkedIn Jobs', location: 'United Kingdom', applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=United+Kingdom`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Browse ${role} listings on LinkedIn in the UK.` },
      { id: 'reed', title: `${role} — Reed.co.uk`, company: 'Reed', location: 'United Kingdom', applyUrl: `https://www.reed.co.uk/jobs/${encoded.replace(/%20/g, '-')}-jobs`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Search ${role} jobs on Reed, the UK's #1 job site.` },
      { id: 'totaljobs', title: `${role} — Totaljobs`, company: 'Totaljobs', location: 'United Kingdom', applyUrl: `https://www.totaljobs.com/jobs/${encoded.replace(/%20/g, '-')}`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Find ${role} positions on Totaljobs UK.` },
    ],
    ca: [
      { id: 'linkedin-ca', title: `${role} — LinkedIn Canada`, company: 'LinkedIn Jobs', location: 'Canada', applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=Canada`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Browse ${role} listings on LinkedIn in Canada.` },
      { id: 'jobbank', title: `${role} — Job Bank Canada (Official)`, company: 'Government of Canada', location: 'Canada', applyUrl: `https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=${encoded}`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Official Canadian government job board for ${role}.` },
      { id: 'indeed-ca', title: `${role} — Indeed Canada`, company: 'Indeed', location: 'Canada', applyUrl: `https://ca.indeed.com/jobs?q=${encoded}&l=Canada`, logo: null, isRemote: false, employmentType: 'Full-time', salary: null, postedAt: null, description: `Search ${role} jobs on Indeed Canada.` },
    ],
  };

  return links[country] || links['us'];
}

module.exports = router;
