const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/workspaces - Get all workspaces for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(`
            SELECT 
                w.id, w.user_id, w.name, w.role, w.created_at, w.last_opened_lesson,
                ra.analysis_data,
                (SELECT COUNT(*) FROM roadmap_progress rp WHERE rp.workspace_id = w.id) as completed_count,
                (SELECT json_agg(topic_name) FROM roadmap_progress rp WHERE rp.workspace_id = w.id) as completed_topics
            FROM workspaces w
            LEFT JOIN role_analyses ra ON w.id = ra.workspace_id
            WHERE w.user_id = $1 
            ORDER BY w.created_at DESC
        `, [userId]);

        const enrichedWorkspaces = result.rows.map(row => {
            const hasPlan = !!row.analysis_data;
            const completedCount = parseInt(row.completed_count) || 0;
            const completedTopics = row.completed_topics || [];
            
            let totalCount = 0;
            let nextEligibleLesson = null;

            if (hasPlan && row.analysis_data.roadmap) {
                const roadmap = row.analysis_data.roadmap;
                for (const phase of roadmap) {
                    if (phase.topics) {
                        for (const topic of phase.topics) {
                            totalCount++;
                            if (!nextEligibleLesson && !completedTopics.includes(topic.id)) {
                                nextEligibleLesson = topic.id;
                            }
                        }
                    }
                }
            }

            return {
                id: row.id,
                user_id: row.user_id,
                name: row.name,
                role: row.role,
                created_at: row.created_at,
                lastOpenedLesson: row.last_opened_lesson,
                hasPlan,
                completedCount,
                totalCount,
                nextEligibleLesson
            };
        });

        res.json({ success: true, workspaces: enrichedWorkspaces });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
});

// POST /api/workspaces - Create a new workspace
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, role } = req.body;
        
        if (!name || !role) {
            return res.status(400).json({ error: 'name and role are required' });
        }

        const result = await pool.query(
            'INSERT INTO workspaces (user_id, name, role) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, role]
        );
        res.status(201).json({ success: true, workspace: result.rows[0] });
    } catch (error) {
        console.error('Error creating workspace:', error);
        res.status(500).json({ error: 'Failed to create workspace' });
    }
});

// DELETE /api/workspaces/:id - Delete a workspace
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Workspace not found or unauthorized' });
        }
        res.json({ success: true, message: 'Workspace deleted successfully', deletedWorkspace: result.rows[0] });
    } catch (error) {
        console.error('Error deleting workspace:', error);
        res.status(500).json({ error: 'Failed to delete workspace' });
    }
});

// POST /api/workspaces/set-active
router.post('/set-active', async (req, res) => {
    try {
        const userId = req.user.id;
        const { workspaceId } = req.body;
        if (!workspaceId) {
            return res.status(400).json({ error: 'workspaceId is required' });
        }
        
        // Verify ownership
        const workspaceResult = await pool.query('SELECT id FROM workspaces WHERE id = $1 AND user_id = $2', [workspaceId, userId]);
        if (workspaceResult.rowCount === 0) {
            return res.status(404).json({ error: 'Workspace not found or unauthorized' });
        }

        await pool.query('UPDATE users SET current_workspace_id = $1 WHERE id = $2', [workspaceId, userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error setting active workspace:', error);
        res.status(500).json({ error: 'Failed to set active workspace' });
    }
});

// POST /api/workspaces/:id/last-opened
router.post('/:id/last-opened', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({ error: 'lessonId is required' });
        }

        const result = await pool.query(
            'UPDATE workspaces SET last_opened_lesson = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [lessonId, id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Workspace not found or unauthorized' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error setting last opened lesson:', error);
        res.status(500).json({ error: 'Failed to set last opened lesson' });
    }
});

// PATCH /api/workspaces/:id - Rename a workspace
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'name is required' });
        }

        const result = await pool.query(
            'UPDATE workspaces SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [name.trim(), id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Workspace not found or unauthorized' });
        }

        res.json({ success: true, workspace: result.rows[0] });
    } catch (error) {
        console.error('Error renaming workspace:', error);
        res.status(500).json({ error: 'Failed to rename workspace' });
    }
});


// POST /api/workspaces/sync-role - Generate/Fetch analysis for the selected workspace role
router.post('/sync-role', async (req, res) => {
    try {
       // We can just proxy this manually back to the /api/role/analyze mechanism via fetch if we want on frontend
       // But creating this stub just in case we need specific backend caching later.
       res.json({ message: "Use /api/role/analyze to build the roadmap for the workspace." });
    } catch (err) {
       res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
