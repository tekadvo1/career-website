const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/admin/courses
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
        res.json({ success: true, courses: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/admin/courses
router.post('/', async (req, res) => {
    try {
        const { title, description, price, is_active } = req.body;
        const result = await pool.query(
            'INSERT INTO courses (title, description, price, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, price, is_active ?? true]
        );
        res.status(201).json({ success: true, course: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/courses/:id
router.put('/:id', async (req, res) => {
    try {
        const { title, description, price, is_active } = req.body;
        const result = await pool.query(
            'UPDATE courses SET title = $1, description = $2, price = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [title, description, price, is_active, req.params.id]
        );
        res.json({ success: true, course: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/admin/courses/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('UPDATE courses SET is_active = false WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
