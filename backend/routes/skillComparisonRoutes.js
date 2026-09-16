const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect } = require('../middleware/authMiddleware');
const { checkAICredits } = require('../middleware/creditMiddleware');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper to safely parse JSON from AI response
const parseJSON = (str) => {
    try {
        const match = str.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : null;
    } catch {
        return null;
    }
};

// ── POST /api/skill-comparison/extract ─────────────────────────────────────
router.post('/extract', protect, checkAICredits, async (req, res) => {
    const { job_description } = req.body;

    if (!job_description || job_description.length > 15000) {
        return res.status(400).json({ error: 'Job description is required and must be under 15000 characters.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical recruiter and career coach. Extract the structured requirements from the provided job description.
                    
For each requirement, provide:
- id: a unique, stable string ID (e.g. 'req-1', 'req-react-2')
- category: one of 'Skills', 'Tools', 'Responsibilities', 'Experience', 'Qualifications', 'Location'
- name: a concise label for the requirement
- type: 'Required', 'Preferred', or 'Mentioned'
- excerpt: a short exact quote from the job description supporting this requirement.

Return a JSON object with a 'requirements' array. Do not include markdown formatting or extra text outside the JSON.`
                },
                {
                    role: "user",
                    content: `Job Description:\n\n${job_description}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
        });

        const reply = completion.choices[0].message.content;
        const parsed = parseJSON(reply);

        if (parsed && parsed.requirements) {
            // Ensure stable IDs are present
            const requirements = parsed.requirements.map(req => ({
                ...req,
                id: req.id || `req-${uuidv4()}`
            }));
            res.json({ success: true, requirements });
        } else {
            res.status(500).json({ error: 'Failed to parse AI extraction response' });
        }
    } catch (error) {
        console.error('Extraction Error:', error);
        res.status(500).json({ error: 'Failed to extract requirements' });
    }
});

// ── POST /api/skill-comparison/compare ─────────────────────────────────────
router.post('/compare', protect, checkAICredits, async (req, res) => {
    const { requirements, skill_snapshot } = req.body;

    if (!requirements || !Array.isArray(requirements)) {
        return res.status(400).json({ error: 'requirements array is required' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical career advisor. You are comparing a list of job requirements against the user's confirmed skills and learning progress.

For each requirement, provide:
- requirement_id: matching the input ID
- status: exactly one of: 'Confirmed', 'Related Experience', 'Learning', 'Not Enough Information'
- explanation: A short, encouraging explanation of why it received this status.
- related_user_data: The specific piece of user data that led to this conclusion (or null).
- recommended_next_step: A brief suggestion (e.g., "Add to learning plan", "Take a quiz", "Review documentation")

Return a JSON object with a 'comparisons' array. Do not invent missing skills as a negative; just use 'Not Enough Information'.`
                },
                {
                    role: "user",
                    content: `Requirements:\n${JSON.stringify(requirements)}\n\nUser Skill Snapshot:\n${JSON.stringify(skill_snapshot || {})}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
        });

        const reply = completion.choices[0].message.content;
        const parsed = parseJSON(reply);

        if (parsed && parsed.comparisons) {
            res.json({ success: true, comparisons: parsed.comparisons });
        } else {
            res.status(500).json({ error: 'Failed to parse AI comparison response' });
        }
    } catch (error) {
        console.error('Comparison Error:', error);
        res.status(500).json({ error: 'Failed to generate comparison' });
    }
});

// ── POST /api/skill-comparison/save ────────────────────────────────────────
router.post('/save', protect, async (req, res) => {
    const userId = req.user.id;
    const { 
        id, // optional: if provided, update existing
        role_analysis_id, 
        job_title, 
        company_name, 
        job_description, 
        source_url, 
        requirements, 
        skill_snapshot, 
        comparison_results, 
        learning_connections 
    } = req.body;

    if (!job_description) {
        return res.status(400).json({ error: 'job_description is required' });
    }

    try {
        if (id) {
            // Update existing (verify ownership)
            const result = await pool.query(
                `UPDATE skill_comparisons 
                 SET job_title = $1, company_name = $2, job_description = $3, source_url = $4, requirements = $5, skill_snapshot = $6, comparison_results = $7, learning_connections = $8, updated_at = NOW()
                 WHERE id = $9 AND user_id = $10
                 RETURNING id, updated_at`,
                [job_title, company_name, job_description, source_url, JSON.stringify(requirements), JSON.stringify(skill_snapshot), JSON.stringify(comparison_results), JSON.stringify(learning_connections), id, userId]
            );
            if (result.rows.length === 0) {
                return res.status(403).json({ error: 'Not authorized to update this comparison or it does not exist.' });
            }
            return res.json({ success: true, id: result.rows[0].id, updated_at: result.rows[0].updated_at });
        } else {
            // Create new
            const result = await pool.query(
                `INSERT INTO skill_comparisons (user_id, role_analysis_id, job_title, company_name, job_description, source_url, requirements, skill_snapshot, comparison_results, learning_connections)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING id, created_at as updated_at`,
                [userId, role_analysis_id || null, job_title, company_name, job_description, source_url, JSON.stringify(requirements), JSON.stringify(skill_snapshot), JSON.stringify(comparison_results), JSON.stringify(learning_connections)]
            );
            return res.json({ success: true, id: result.rows[0].id, updated_at: result.rows[0].updated_at });
        }
    } catch (err) {
        console.error('Save skill comparison error:', err);
        res.status(500).json({ error: 'Failed to save skill comparison' });
    }
});

// ── GET /api/skill-comparison/saved ────────────────────────────────────────
router.get('/saved', protect, async (req, res) => {
    const userId = req.user.id;
    const { comparison_id, role_analysis_id } = req.query;

    try {
        let query, params;
        if (comparison_id) {
            query = `SELECT * FROM skill_comparisons WHERE user_id = $1 AND id = $2`;
            params = [userId, comparison_id];
        } else if (role_analysis_id) {
            query = `SELECT * FROM skill_comparisons WHERE user_id = $1 AND role_analysis_id = $2 ORDER BY updated_at DESC LIMIT 1`;
            params = [userId, role_analysis_id];
        } else {
            query = `SELECT * FROM skill_comparisons WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`;
            params = [userId];
        }

        const result = await pool.query(query, params);
        if (result.rows.length > 0) {
            res.json({ success: true, data: result.rows[0] });
        } else {
            res.json({ success: true, data: null });
        }
    } catch (err) {
        console.error('Fetch skill comparison error:', err);
        res.status(500).json({ error: 'Failed to fetch saved skill comparison' });
    }
});

module.exports = router;
