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
    // ── PASS 0: Extract job dates → compute precise experience in Node.js ──────
    let preciseExperienceLabel = null;
    let preciseExperienceYears = null;

    try {
      const expRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a resume parser. Extract ONLY work experience dates. Return valid JSON only — no markdown, no explanation.',
            },
            {
              role: 'user',
              content: `Read this resume and extract every job position with its exact start and end dates.
For jobs that are still ongoing (current), use today: ${new Date().toISOString().slice(0, 7)}.

Return ONLY this JSON (no other text):
{
  "jobs": [
    { "title": "Job Title", "company": "Company", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "isCurrent": false }
  ]
}

Rules:
- If only year given (e.g. 2022), use YYYY-01 for start and YYYY-12 for end.
- If month + year given (e.g. March 2021), convert to 2021-03.
- Include ALL paid employment positions with clear date ranges.

Resume:
${resumeText.substring(0, 25000)}`,
            },
          ],
          temperature: 0,
          max_tokens: 800,
        }),
      });

      if (expRes.ok) {
        const expData = await expRes.json();
        const expRaw = expData.choices[0].message.content;
        try {
          const expMatch = expRaw.match(/```json\n([\s\S]*?)\n```/) || expRaw.match(/```\n([\s\S]*?)\n```/);
          const expParsed = JSON.parse(expMatch ? expMatch[1] : expRaw);

          if (expParsed?.jobs && Array.isArray(expParsed.jobs) && expParsed.jobs.length > 0) {
            console.log(`[JobMatch] PASS 0 Extracted Jobs =>`, JSON.stringify(expParsed.jobs)); // Added log to trace GPT errors directly in Railway
            
            const periods = expParsed.jobs
              .filter(j => j.startDate && j.endDate)
              .map(j => {
                const [sy, sm] = j.startDate.split('-').map(Number);
                const [ey, em] = j.endDate.split('-').map(Number);
                return { start: sy * 12 + (sm || 1), end: ey * 12 + (em || 12) };
              })
              .filter(p => p.end >= p.start)
              .sort((a, b) => a.start - b.start);

            // Merge overlapping periods so parallel jobs aren't double-counted
            const merged = [];
            for (const p of periods) {
              if (merged.length === 0 || p.start > merged[merged.length - 1].end) {
                merged.push({ ...p });
              } else {
                merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, p.end);
              }
            }

            // Fixed inclusive math: (+ 1) because working from Jan to Feb is 2 months, not 1
            const totalMonths = merged.reduce((sum, p) => sum + (p.end - p.start + 1), 0);
            if (totalMonths > 0) {
              const years = Math.floor(totalMonths / 12);
              const months = totalMonths % 12;
              preciseExperienceYears = Math.round((totalMonths / 12) * 10) / 10;
              if (years > 0 && months > 0) {
                preciseExperienceLabel = `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
              } else if (years > 0) {
                preciseExperienceLabel = `${years} year${years !== 1 ? 's' : ''}`;
              } else {
                preciseExperienceLabel = `${months} month${months !== 1 ? 's' : ''}`;
              }
              console.log(`[JobMatch] Computed experience: ${preciseExperienceLabel} (${totalMonths} months from ${merged.length} periods)`);
            }
          }
        } catch (e) {
          console.warn('[JobMatch] Experience parse failed (non-fatal):', e.message);
        }
      }
    } catch (e) {
      console.warn('[JobMatch] Experience extraction pass failed (non-fatal):', e.message);
    }

    // ── PASS 1: Full role analysis (pre-computed experience injected) ──────────
    const experienceInstruction = preciseExperienceLabel
      ? `CRITICAL: The candidate's EXACT total experience has been mathematically calculated as ${preciseExperienceLabel} (${preciseExperienceYears} years). You MUST use exactly these values in totalExperienceLabel and totalExperienceYears — do NOT recalculate or modify them.`
      : 'Extract total experience from the job dates in the resume as precisely as possible.';

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical recruiter and career advisor. Analyze resumes deeply and return precise, honest role matching data. Always return valid JSON only — no markdown, no extra text.',
          },
          {
            role: 'user',
            content: `Carefully analyze this resume and return an UNLIMITED and exhaustive list of ALL eligible job roles this person qualifies for (NO LIMIT — include every role from 50% match and above). You MUST find at least 10 to 20 different job roles if the resume supports it. Do not stop at just 4 or 5 roles. Explore leadership, specialized niches, and lateral moves.

${experienceInstruction}

RULES:
- DO NOT make up skills or experience — only use what is explicitly in the resume.
- Match percent must honestly reflect the resume evidence (do not inflate).
- Mandate: Include an UNLIMITED number of ALL roles the person is eligible for, sorted by matchPercent descending. Output as many valid roles as possible to give the candidate options.

For EACH role provide:
- roleName: exact professional job title
- matchPercent: integer 50-100 based ONLY on resume evidence
- demandLevel: "High" | "Medium" | "Low"
- experienceLevel: "Entry" | "Mid" | "Senior"
- whyExplanation: {
    "overallReason": "1-2 sentences summarizing why this match %",
    "skillsMatched": [{ "skill": "React", "evidence": "Used in 3 projects mentioned in resume" }],
    "keywordsFound": ["keyword1", "keyword2"],
    "technicalStrengths": ["strength1", "strength2"],
    "experienceAlignment": "How years/level of experience aligns to this role",
    "missingSkills": [{ "skill": "GraphQL", "impact": "Would raise match by ~5%" }],
    "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  }

Return ONLY this valid JSON:
{
  "candidateName": "Full name or null",
  "totalExperienceLabel": "${preciseExperienceLabel || 'compute from resume'}",
  "totalExperienceYears": ${preciseExperienceYears !== null ? preciseExperienceYears : 'null'},
  "experienceSummary": "2-3 sentence professional summary based on actual resume",
  "topSkills": ["skill1", "skill2", "...up to 8"],
  "roles": [{ "roleName": "", "matchPercent": 0, "demandLevel": "High", "experienceLevel": "Mid", "whyExplanation": {} }]
}

Resume:
${resumeText.substring(0, 25000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 12000,
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

    // Force-lock the mathematically computed experience (never let GPT override this)
    if (preciseExperienceLabel) {
      analysis.totalExperienceLabel = preciseExperienceLabel;
      analysis.totalExperienceYears = preciseExperienceYears;
    }

    // ── PASS 2: Verify roles/skills only (experience already locked above) ────
    try {
      const verifyRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a quality reviewer. Validate resume role matching JSON. Return corrected JSON only, no markdown, no extra text.',
            },
            {
              role: 'user',
              content: `Review this resume analysis. Check ONLY:
1. Are matchPercent values honest and evidence-based (not inflated)?
2. Are skills in whyExplanation actually present in the resume text?
3. Fix any issues and return the corrected full JSON. Ensure NONE of the roles are truncated from the array! Output ALL roles!

IMPORTANT: Do NOT change totalExperienceLabel or totalExperienceYears — keep them exactly as they are.

Resume (first 15000 chars): ${resumeText.substring(0, 15000)}

Analysis: ${JSON.stringify(analysis)}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 12000,
        }),
      });

      if (verifyRes.ok) {
        const vData = await verifyRes.json();
        const vRaw = vData.choices[0].message.content;
        try {
          const vMatch = vRaw.match(/```json\n([\s\S]*?)\n```/) || vRaw.match(/```\n([\s\S]*?)\n```/);
          const verified = JSON.parse(vMatch ? vMatch[1] : vRaw);
          if (verified?.roles && Array.isArray(verified.roles)) {
            analysis = verified;
            // Re-lock experience after verification (in case GPT changed it)
            if (preciseExperienceLabel) {
              analysis.totalExperienceLabel = preciseExperienceLabel;
              analysis.totalExperienceYears = preciseExperienceYears;
            }
          }
        } catch { /* keep original if parse fails */ }
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
    const analysisData = row.analysis_data;

    // Invalidate old cache if it doesn't have the new precise experience fields
    // (forces re-upload with the improved backend)
    const hasNewSchema = analysisData?.totalExperienceLabel && analysisData?.roles?.[0]?.whyExplanation;
    if (!hasNewSchema) {
      // Delete the stale record so user is prompted to re-upload
      await pool.query('DELETE FROM job_match_analyses WHERE user_id = $1', [userId]);
      return res.json({ success: true, analysis: null, staleCache: true });
    }

    return res.json({
      success: true,
      fileName: row.file_name,
      analysis: analysisData,
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

// ==========================================
// TARGET ROLES (Job Search Portal)
// ==========================================

// Save user's selected roles
router.post('/save-target-roles', async (req, res) => {
  try {
    const { roles } = req.body;
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'Valid roles array is required.' });
    }

    const userId = req.user.id;
    await pool.query(
      `INSERT INTO user_target_roles (user_id, roles, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET roles = EXCLUDED.roles, updated_at = NOW()`,
      [userId, JSON.stringify(roles)]
    );

    res.json({ success: true, message: 'Roles saved securely.' });
  } catch (err) {
    console.error('Error saving target roles:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Retrieve user's saved roles
router.get('/target-roles', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT roles FROM user_target_roles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.json({ success: true, roles: [] });
    }

    res.json({ success: true, roles: result.rows[0].roles });
  } catch (err) {
    console.error('Error fetching target roles:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch Live Jobs via JSearch API (RapidAPI)
router.get('/live-jobs', async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ error: 'Role parameter is required' });
    }

    const query = encodeURIComponent(`${role} jobs in USA`);
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '53fd7904e8msh410bfe6c2a5698ap1d2d6fjsn3670c8c50870',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    };

    // Fetch multiple pages (30+ jobs per role) specifically from the last 24 hours (today)
    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_pages=3&country=us&date_posted=today`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`JSearch API Error: ${response.status}`);
    }

    const result = await response.json();
    
    // Map JSearch response structure to our frontend's expected properties
    const standardJobs = (result.data || []).map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : (job.job_country || 'Remote/USA'),
      applyUrl: job.job_apply_link || job.job_google_link || '#',
      logo: job.employer_logo || null,
      isRemote: job.job_is_remote === true,
      employmentType: job.job_employment_type || 'Full-time',
      salary: job.job_min_salary && job.job_max_salary 
          ? `$${(job.job_min_salary/1000).toFixed(0)}k - $${(job.job_max_salary/1000).toFixed(0)}k/yr` 
          : 'Competitive Salary',
      postedAt: job.job_posted_at_timestamp ? new Date(job.job_posted_at_timestamp * 1000).toISOString() : new Date().toISOString(),
      description: job.job_description ? job.job_description.substring(0, 300) + '...' : ''
    }));

    res.json({ success: true, data: standardJobs });
  } catch (err) {
    console.error('Error fetching JSearch live jobs:', err);
    res.status(500).json({ error: 'Failed to fetch live jobs from vendor.' });
  }
});

module.exports = router;
