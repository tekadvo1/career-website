const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/admin/courses/generate-description
router.post('/generate-description', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: 'Course title is required' });

        const systemPrompt = `You are an expert Course Creator and Marketer. 
The user is creating a new course titled: "${title}".
Generate a highly engaging, professional course description of about 150-250 words.
Include:
- An engaging hook (feel free to use an appropriate emoji).
- A brief overview of what the student will learn.
- 3-5 bullet points covering the core modules or topics.
- A strong concluding sentence.
Do not wrap the output in quotes. Output markdown formatting.`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Please generate the course description." }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        const completion = await openai.chat.completions.create(requestOptions);
        res.json({ success: true, description: completion.choices[0].message.content });
    } catch (err) {
        console.error('Course AI Description Error:', err);
        res.status(500).json({ error: 'Failed to generate description' });
    }
});

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
