const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/admin/customers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json({ success: true, customers: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/admin/customers
router.post('/', async (req, res) => {
    try {
        const { full_name, email, phone, notes } = req.body;
        const result = await pool.query(
            'INSERT INTO customers (full_name, email, phone, notes, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [full_name, email, phone, notes, req.user.id]
        );
        res.status(201).json({ success: true, customer: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/customers/:id
router.put('/:id', async (req, res) => {
    try {
        const { full_name, email, phone, notes } = req.body;
        const result = await pool.query(
            'UPDATE customers SET full_name = $1, email = $2, phone = $3, notes = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [full_name, email, phone, notes, req.params.id]
        );
        res.json({ success: true, customer: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/admin/customers/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/customers/:id/invoices
router.get('/:id/invoices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC', [req.params.id]);
        res.json({ success: true, invoices: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
