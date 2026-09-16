const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/notes - List notes (excerpts)
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const { search, tag, related_type, related_id } = req.query;

    try {
        let query = `
            SELECT id, title, SUBSTRING(body FROM 1 FOR 150) as excerpt, 
                   tags, related_type, related_id, related_title, updated_at
            FROM learning_notes
            WHERE user_id = $1
        `;
        const params = [userId];
        let paramIndex = 2;

        if (search) {
            query += ` AND (title ILIKE $${paramIndex} OR body ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (tag) {
            query += ` AND tags @> $${paramIndex}::jsonb`;
            params.push(JSON.stringify([tag]));
            paramIndex++;
        }

        if (related_type) {
            query += ` AND related_type = $${paramIndex}`;
            params.push(related_type);
            paramIndex++;
            
            if (related_id) {
                query += ` AND related_id = $${paramIndex}`;
                params.push(related_id);
                paramIndex++;
            }
        }

        query += ` ORDER BY updated_at DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, notes: result.rows });
    } catch (err) {
        console.error('Fetch notes error:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// GET /api/notes/:id - Get full note
router.get('/:id', async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT * FROM learning_notes WHERE id = $1 AND user_id = $2`,
            [noteId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ success: true, note: result.rows[0] });
    } catch (err) {
        console.error('Fetch note error:', err);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// POST /api/notes - Create note
router.post('/', async (req, res) => {
    const userId = req.user.id;
    const { title, body, tags, related_type, related_id, related_title } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO learning_notes (user_id, title, body, tags, related_type, related_id, related_title)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                userId, 
                title || 'Untitled Note', 
                body || '', 
                tags ? JSON.stringify(tags) : null,
                related_type || null,
                related_id || null,
                related_title || null
            ]
        );
        res.status(201).json({ success: true, note: result.rows[0] });
    } catch (err) {
        console.error('Create note error:', err);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT /api/notes/:id - Update note (with revision check)
router.put('/:id', async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, body, tags, related_type, related_id, related_title, revision } = req.body;

    if (revision === undefined) {
        return res.status(400).json({ error: 'Revision is required for updates' });
    }

    try {
        // First check revision
        const currentResult = await pool.query(
            `SELECT revision FROM learning_notes WHERE id = $1 AND user_id = $2`,
            [noteId, userId]
        );
        
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        const currentRevision = currentResult.rows[0].revision;
        if (currentRevision > revision) {
            return res.status(409).json({ 
                error: 'Conflict: A newer version of this note exists on the server.',
                current_revision: currentRevision
            });
        }

        const result = await pool.query(
            `UPDATE learning_notes
             SET title = $1, body = $2, tags = $3, related_type = $4, related_id = $5, related_title = $6,
                 revision = revision + 1, updated_at = NOW()
             WHERE id = $7 AND user_id = $8 AND revision = $9
             RETURNING *`,
            [
                title || 'Untitled Note', 
                body || '', 
                tags ? JSON.stringify(tags) : null,
                related_type || null,
                related_id || null,
                related_title || null,
                noteId,
                userId,
                revision
            ]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({ error: 'Conflict: Note was updated by another process.' });
        }

        res.json({ success: true, note: result.rows[0] });
    } catch (err) {
        console.error('Update note error:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM learning_notes WHERE id = $1 AND user_id = $2 RETURNING id`,
            [noteId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found or not authorized' });
        }
        
        res.json({ success: true, deleted_id: noteId });
    } catch (err) {
        console.error('Delete note error:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

module.exports = router;
