const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/portfolio/draft
// @desc    Get the current user's portfolio draft
// @access  Private
router.get('/draft', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT id, user_id, is_private, is_published, about, experiences, skills, linkedin, website, theme, draft_revision, updated_at FROM portfolios WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Return empty draft with default revision 1
            return res.json({
                success: true,
                draft: null
            });
        }

        res.json({
            success: true,
            draft: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching portfolio draft:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/portfolio/draft
// @desc    Save the user's portfolio draft
// @access  Private
router.post('/draft', async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            is_private,
            about,
            experiences,
            skills,
            linkedin,
            website,
            theme,
            draft_revision // Revision expected from client
        } = req.body;

        // 1. Validate inputs
        if (theme && !['minimalist', 'dark', 'executive'].includes(theme)) {
            return res.status(400).json({ success: false, message: 'Invalid theme selected' });
        }
        if (linkedin && linkedin.length > 255) {
            return res.status(400).json({ success: false, message: 'LinkedIn URL too long' });
        }
        if (website && website.length > 255) {
            return res.status(400).json({ success: false, message: 'Website URL too long' });
        }

        const safeAbout = about || '';
        const safeExperiences = Array.isArray(experiences) ? experiences : [];
        const safeSkills = Array.isArray(skills) ? skills : [];
        const safeLinkedin = linkedin || '';
        const safeWebsite = website || '';
        const safeTheme = theme || 'minimalist';
        const isPrivate = typeof is_private === 'boolean' ? is_private : true;
        const clientRevision = parseInt(draft_revision, 10) || 1;

        // 2. Concurrency Check
        const currentRes = await pool.query('SELECT draft_revision FROM portfolios WHERE user_id = $1', [userId]);
        
        if (currentRes.rows.length > 0) {
            const currentRevision = currentRes.rows[0].draft_revision;
            
            // If the client's revision is LESS than the server's, they are editing stale data.
            if (clientRevision < currentRevision) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'Conflict: This portfolio was modified in another tab or session. Please reload to see the latest version.',
                    current_revision: currentRevision
                });
            }

            // Update existing draft, incrementing the revision
            const updatedRes = await pool.query(
                `UPDATE portfolios SET 
                    is_private = $1, 
                    about = $2, 
                    experiences = $3, 
                    skills = $4, 
                    linkedin = $5, 
                    website = $6, 
                    theme = $7, 
                    draft_revision = draft_revision + 1, 
                    updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $8 
                 RETURNING draft_revision, updated_at`,
                [isPrivate, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme, userId]
            );

            return res.json({
                success: true,
                message: 'Draft saved successfully',
                draft_revision: updatedRes.rows[0].draft_revision,
                updated_at: updatedRes.rows[0].updated_at
            });

        } else {
            // Create a new draft starting at revision 1
            const insertedRes = await pool.query(
                `INSERT INTO portfolios (user_id, is_private, about, experiences, skills, linkedin, website, theme, draft_revision) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) 
                 RETURNING draft_revision, updated_at`,
                [userId, isPrivate, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme]
            );

            return res.json({
                success: true,
                message: 'Draft created successfully',
                draft_revision: insertedRes.rows[0].draft_revision,
                updated_at: insertedRes.rows[0].updated_at
            });
        }
    } catch (err) {
        console.error('Error saving portfolio draft:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/portfolio/import-legacy
// @desc    Explicitly accept legacy sessionStorage data
// @access  Private
router.post('/import-legacy', async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            isPrivate,
            about,
            experiences,
            skills,
            linkedin,
            website,
            theme
        } = req.body;

        const safeAbout = about || '';
        const safeExperiences = Array.isArray(experiences) ? experiences : [];
        const safeSkills = Array.isArray(skills) ? skills : [];
        const safeLinkedin = linkedin || '';
        const safeWebsite = website || '';
        const safeTheme = theme || 'minimalist';
        const isPrivateBool = typeof isPrivate === 'boolean' ? isPrivate : true;

        // Check if there is already a portfolio
        const currentRes = await pool.query('SELECT draft_revision FROM portfolios WHERE user_id = $1', [userId]);
        
        if (currentRes.rows.length > 0) {
            // Already has a portfolio. We overwrite but increment revision since it's an explicit "Import" action requested by user.
            const updatedRes = await pool.query(
                `UPDATE portfolios SET 
                    is_private = $1, 
                    about = $2, 
                    experiences = $3, 
                    skills = $4, 
                    linkedin = $5, 
                    website = $6, 
                    theme = $7, 
                    draft_revision = draft_revision + 1, 
                    updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $8 
                 RETURNING draft_revision, updated_at`,
                [isPrivateBool, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme, userId]
            );

            return res.json({
                success: true,
                message: 'Legacy draft imported successfully',
                draft_revision: updatedRes.rows[0].draft_revision,
                updated_at: updatedRes.rows[0].updated_at
            });
        } else {
            // Create new
            const insertedRes = await pool.query(
                `INSERT INTO portfolios (user_id, is_private, about, experiences, skills, linkedin, website, theme, draft_revision) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) 
                 RETURNING draft_revision, updated_at`,
                [userId, isPrivateBool, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme]
            );

            return res.json({
                success: true,
                message: 'Legacy draft imported successfully',
                draft_revision: insertedRes.rows[0].draft_revision,
                updated_at: insertedRes.rows[0].updated_at
            });
        }
    } catch (err) {
        console.error('Error importing legacy draft:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
