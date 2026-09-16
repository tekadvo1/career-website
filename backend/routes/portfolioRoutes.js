const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// --- Helper Functions ---
function isSafeUrl(string) {
    if (!string) return true;
    try {
        const url = new URL(string);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        if (url.username || url.password) return false; 
        return true;
    } catch (_) {
        return false;
    }
}

function stripHtml(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
}

async function validatePortfolioData(reqBody, userId) {
    const {
        about,
        experiences,
        skills,
        linkedin,
        website,
        theme
    } = reqBody;

    if (theme && !['minimalist', 'dark', 'executive'].includes(theme)) {
        throw new Error('Invalid theme selected');
    }
    if (linkedin && (linkedin.length > 255 || !isSafeUrl(linkedin))) {
        throw new Error('Invalid LinkedIn URL');
    }
    if (website && (website.length > 255 || !isSafeUrl(website))) {
        throw new Error('Invalid Website URL');
    }

    const safeAbout = stripHtml(about || '').substring(0, 5000);
    
    let safeExperiences = Array.isArray(experiences) ? experiences : [];
    if (safeExperiences.length > 50) safeExperiences = safeExperiences.slice(0, 50);
    
    for (let i = 0; i < safeExperiences.length; i++) {
        const exp = safeExperiences[i];
        if (exp && exp.id) {
            const checkRes = await pool.query('SELECT id FROM user_projects WHERE id = $1 AND user_id = $2', [exp.id, userId]);
            if (checkRes.rows.length === 0) {
                throw new Error(`Project reference ${exp.id} is invalid or does not belong to you`);
            }
        }
        if (exp.title) exp.title = stripHtml(exp.title).substring(0, 255);
        if (exp.role) exp.role = stripHtml(exp.role).substring(0, 255);
        if (exp.date) exp.date = stripHtml(exp.date).substring(0, 100);
        if (exp.description) exp.description = stripHtml(exp.description).substring(0, 2000);
        
        // Structured project fields
        if (exp.summary) exp.summary = stripHtml(exp.summary).substring(0, 500);
        if (exp.problem) exp.problem = stripHtml(exp.problem).substring(0, 2000);
        if (exp.built) exp.built = stripHtml(exp.built).substring(0, 2000);
        if (exp.contribution) exp.contribution = stripHtml(exp.contribution).substring(0, 2000);
        if (exp.technologies) exp.technologies = stripHtml(exp.technologies).substring(0, 500);
        if (exp.challenge) exp.challenge = stripHtml(exp.challenge).substring(0, 2000);
        if (exp.learned) exp.learned = stripHtml(exp.learned).substring(0, 2000);
        if (exp.nextSteps) exp.nextSteps = stripHtml(exp.nextSteps).substring(0, 2000);
        
        // Links
        if (exp.repoUrl && (!isSafeUrl(exp.repoUrl) || exp.repoUrl.length > 255)) {
            delete exp.repoUrl;
        }
        if (exp.liveUrl && (!isSafeUrl(exp.liveUrl) || exp.liveUrl.length > 255)) {
            delete exp.liveUrl;
        }
        
        // Booleans
        if (exp.isProject !== undefined) exp.isProject = !!exp.isProject;
        if (exp.isFeatured !== undefined) exp.isFeatured = !!exp.isFeatured;
    }

    let safeSkills = Array.isArray(skills) ? skills : [];
    if (safeSkills.length > 50) safeSkills = safeSkills.slice(0, 50);
    safeSkills = safeSkills.map(s => stripHtml(String(s)).substring(0, 100));

    return {
        safeAbout,
        safeExperiences,
        safeSkills,
        safeLinkedin: linkedin || '',
        safeWebsite: website || '',
        safeTheme: theme || 'minimalist'
    };
}
// ------------------------

// @route   GET /api/portfolio/public/:username
// @desc    Fetch a public portfolio for viewing
// @access  Public
router.get('/public/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const query = `
            SELECT p.published_data, p.is_private, p.is_published, u.username
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            WHERE u.username = $1
        `;
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }

        const portfolio = result.rows[0];

        if (portfolio.is_private || !portfolio.is_published) {
            return res.status(404).json({ success: false, message: 'Portfolio is private or unavailable' });
        }

        let parsedData = {};
        if (portfolio.published_data) {
            const raw = typeof portfolio.published_data === 'string' 
                ? JSON.parse(portfolio.published_data) 
                : portfolio.published_data;
                
            // Explicit allowlist of public fields. Exclude draft_revision, internal notes, etc.
            parsedData = {
                about: raw.about || '',
                experiences: Array.isArray(raw.experiences) ? raw.experiences.map(exp => ({
                    id: exp.id,
                    title: exp.title,
                    role: exp.role,
                    date: exp.date,
                    description: exp.description,
                    summary: exp.summary,
                    problem: exp.problem,
                    built: exp.built,
                    contribution: exp.contribution,
                    technologies: exp.technologies,
                    challenge: exp.challenge,
                    learned: exp.learned,
                    nextSteps: exp.nextSteps,
                    repoUrl: exp.repoUrl,
                    liveUrl: exp.liveUrl,
                    isProject: !!exp.isProject,
                    isFeatured: !!exp.isFeatured
                })) : [],
                skills: Array.isArray(raw.skills) ? raw.skills : [],
                linkedin: raw.linkedin || '',
                website: raw.website || '',
                theme: raw.theme || 'minimalist'
            };
        }

        res.json({
            success: true,
            portfolio: parsedData,
            username: portfolio.username
        });
    } catch (err) {
        console.error('Error fetching public portfolio:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Protect all routes below this line
router.use(protect);

// @route   GET /api/portfolio/draft
// @desc    Get the current user's portfolio draft
// @access  Private
router.get('/draft', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT id, user_id, is_private, is_published, about, experiences, skills, linkedin, website, theme, draft_revision, published_data, updated_at FROM portfolios WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, draft: null });
        }

        const draft = result.rows[0];
        let published_revision = null;
        if (draft.published_data) {
            try {
                const pubData = typeof draft.published_data === 'string' ? JSON.parse(draft.published_data) : draft.published_data;
                published_revision = pubData.draft_revision || null;
            } catch (e) {
                console.error("Error parsing published_data for revision check", e);
            }
        }
        
        // Remove published_data from the response to save bandwidth
        delete draft.published_data;

        res.json({ success: true, draft, published_revision });
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
        const { draft_revision } = req.body;
        
        let validated;
        try {
            validated = await validatePortfolioData(req.body, userId);
        } catch (validationErr) {
            return res.status(400).json({ success: false, message: validationErr.message });
        }
        
        const { safeAbout, safeExperiences, safeSkills, safeLinkedin, safeWebsite, safeTheme } = validated;
        const clientRevision = parseInt(draft_revision, 10) || 1;

        const currentRes = await pool.query('SELECT draft_revision FROM portfolios WHERE user_id = $1', [userId]);
        
        if (currentRes.rows.length > 0) {
            const currentRevision = currentRes.rows[0].draft_revision;
            
            if (clientRevision < currentRevision) {
                return res.status(409).json({ 
                    success: false, 
                    message: 'Conflict: This portfolio was modified in another tab or session. Please reload to see the latest version.',
                    current_revision: currentRevision
                });
            }

            const updatedRes = await pool.query(
                `UPDATE portfolios SET 
                    about = $1, 
                    experiences = $2, 
                    skills = $3, 
                    linkedin = $4, 
                    website = $5, 
                    theme = $6, 
                    draft_revision = draft_revision + 1, 
                    updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $7 
                 RETURNING draft_revision, updated_at`,
                [safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme, userId]
            );

            return res.json({
                success: true,
                message: 'Draft saved successfully',
                draft_revision: updatedRes.rows[0].draft_revision,
                updated_at: updatedRes.rows[0].updated_at
            });

        } else {
            const insertedRes = await pool.query(
                `INSERT INTO portfolios (user_id, is_private, about, experiences, skills, linkedin, website, theme, draft_revision) 
                 VALUES ($1, true, $2, $3, $4, $5, $6, $7, 1) 
                 RETURNING draft_revision, updated_at`,
                [userId, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme]
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
        
        let validated;
        try {
            validated = await validatePortfolioData(req.body, userId);
        } catch (validationErr) {
            return res.status(400).json({ success: false, message: validationErr.message });
        }
        
        const { safeAbout, safeExperiences, safeSkills, safeLinkedin, safeWebsite, safeTheme } = validated;

        const currentRes = await pool.query('SELECT draft_revision FROM portfolios WHERE user_id = $1', [userId]);
        
        if (currentRes.rows.length > 0) {
            const updatedRes = await pool.query(
                `UPDATE portfolios SET 
                    about = $1, 
                    experiences = $2, 
                    skills = $3, 
                    linkedin = $4, 
                    website = $5, 
                    theme = $6, 
                    draft_revision = draft_revision + 1, 
                    updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $7 
                 RETURNING draft_revision, updated_at`,
                [safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme, userId]
            );

            return res.json({
                success: true,
                message: 'Legacy draft imported successfully',
                draft_revision: updatedRes.rows[0].draft_revision,
                updated_at: updatedRes.rows[0].updated_at
            });
        } else {
            const insertedRes = await pool.query(
                `INSERT INTO portfolios (user_id, is_private, about, experiences, skills, linkedin, website, theme, draft_revision) 
                 VALUES ($1, true, $2, $3, $4, $5, $6, $7, 1) 
                 RETURNING draft_revision, updated_at`,
                [userId, safeAbout, JSON.stringify(safeExperiences), JSON.stringify(safeSkills), safeLinkedin, safeWebsite, safeTheme]
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

// @route   POST /api/portfolio/publish
// @desc    Publish the current draft
// @access  Private
router.post('/publish', async (req, res) => {
    try {
        const userId = req.user.id;
        const { expected_draft_revision } = req.body;

        const result = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No draft found to publish' });
        }

        const portfolio = result.rows[0];

        // Revision conflict check
        if (expected_draft_revision && parseInt(expected_draft_revision) !== portfolio.draft_revision) {
            return res.status(409).json({ 
                success: false, 
                message: 'Conflict: The draft has been modified since you last loaded it. Please refresh and review before publishing.',
                current_revision: portfolio.draft_revision
            });
        }

        // Validate minimum content
        const hasAbout = portfolio.about && portfolio.about.trim().length > 0;
        const experiences = typeof portfolio.experiences === 'string' ? JSON.parse(portfolio.experiences) : portfolio.experiences || [];
        const hasExperiences = experiences.length > 0;

        if (!hasAbout && !hasExperiences) {
            return res.status(400).json({ success: false, message: 'Your portfolio must have at least an introduction (About) or one experience/project to be published.' });
        }

        // Create the published snapshot
        const publishedData = {
            about: portfolio.about,
            experiences: experiences,
            skills: typeof portfolio.skills === 'string' ? JSON.parse(portfolio.skills) : portfolio.skills || [],
            linkedin: portfolio.linkedin,
            website: portfolio.website,
            theme: portfolio.theme,
            draft_revision: portfolio.draft_revision
        };

        const updateRes = await pool.query(
            `UPDATE portfolios SET 
                published_data = $1, 
                is_published = true, 
                is_private = false, 
                updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $2 
             RETURNING draft_revision, updated_at`,
            [JSON.stringify(publishedData), userId]
        );

        res.json({
            success: true,
            message: 'Portfolio published successfully',
            published_revision: updateRes.rows[0].draft_revision,
            updated_at: updateRes.rows[0].updated_at
        });

    } catch (err) {
        console.error('Error publishing portfolio:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/portfolio/unpublish
// @desc    Unpublish the portfolio
// @access  Private
router.post('/unpublish', async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            \`UPDATE portfolios SET 
                is_published = false, 
                is_private = true, 
                updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 
             RETURNING id\`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Portfolio not found' });
        }

        res.json({ success: true, message: 'Portfolio unpublished successfully' });

    } catch (err) {
        console.error('Error unpublishing portfolio:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
