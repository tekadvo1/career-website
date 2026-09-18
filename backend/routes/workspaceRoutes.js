const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/workspaces - Get all workspaces for a user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await pool.query(
            'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, workspaces: result.rows });
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
