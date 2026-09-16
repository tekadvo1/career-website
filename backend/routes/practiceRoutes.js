const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkAICredits } = require('../middleware/aiCredits');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// GET /api/practice - List user sessions
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT id, role, topic, status, score, total_questions, updated_at, created_at 
             FROM practice_sessions 
             WHERE user_id = $1 
             ORDER BY updated_at DESC`,
            [userId]
        );
        res.json({ success: true, sessions: result.rows });
    } catch (err) {
        console.error('Fetch practice sessions error:', err);
        res.status(500).json({ error: 'Failed to fetch practice sessions' });
    }
});

// GET /api/practice/:id - Get session and questions (omit answer_index and explanation for unanswered)
router.get('/:id', async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.params.id;

    try {
        const sessionResult = await pool.query(
            `SELECT * FROM practice_sessions WHERE id = $1 AND user_id = $2`,
            [sessionId, userId]
        );
        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const session = sessionResult.rows[0];

        // Fetch questions
        const questionsResult = await pool.query(
            `SELECT id, question_text, options, order_index, answer_index, explanation 
             FROM practice_questions 
             WHERE session_id = $1 
             ORDER BY order_index ASC`,
            [sessionId]
        );

        // Fetch answers
        const answersResult = await pool.query(
            `SELECT question_id, selected_option, is_correct 
             FROM practice_answers 
             WHERE session_id = $1`,
            [sessionId]
        );
        
        const answeredMap = new Map();
        answersResult.rows.forEach(ans => answeredMap.set(ans.question_id, ans));

        // Sanitize questions
        const questions = questionsResult.rows.map(q => {
            const answered = answeredMap.get(q.id);
            if (answered) {
                return {
                    id: q.id,
                    question_text: q.question_text,
                    options: q.options,
                    order_index: q.order_index,
                    answer_index: q.answer_index,
                    explanation: q.explanation,
                    user_answer: answered.selected_option,
                    is_correct: answered.is_correct
                };
            } else {
                return {
                    id: q.id,
                    question_text: q.question_text,
                    options: q.options,
                    order_index: q.order_index
                    // explicitly missing answer_index and explanation
                };
            }
        });

        res.json({ success: true, session, questions });
    } catch (err) {
        console.error('Fetch practice session details error:', err);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// POST /api/practice/start - Generate questions and create session
router.post('/start', checkAICredits, async (req, res) => {
    const userId = req.user.id;
    const { role, topic, numQuestions = 5 } = req.body;

    if (!role || !topic) {
        return res.status(400).json({ error: 'Role and topic are required' });
    }

    try {
        // Generate questions
        let systemPrompt = `You are an expert ${role} Technical Interviewer and Educator.
        The user wants a practice quiz on the topic: "${topic}".
        Generate exactly ${Math.min(numQuestions, 10)} multiple-choice questions suitable for someone learning this topic.
        
        Rules:
        - Ground questions in real-world engineering concepts.
        - Exactly one intended correct answer per question.
        - Provide a clear, educational explanation for why the answer is correct and others are wrong.
        
        Return ONLY valid JSON matching this schema exactly:
        {
          "questions": [
            {
              "question": "The question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answerIndex": 0, // 0-indexed integer of the correct option
              "explanation": "Why this is correct."
            }
          ]
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [{ role: "system", content: systemPrompt }],
            max_tokens: 2000,
            temperature: 0.7,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const generatedData = JSON.parse(completion.choices[0].message.content);
        
        if (!generatedData.questions || !Array.isArray(generatedData.questions) || generatedData.questions.length === 0) {
            throw new Error("Invalid AI response format");
        }

        const totalQ = generatedData.questions.length;

        // Transaction to insert session and questions
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const sessionRes = await client.query(
                `INSERT INTO practice_sessions (user_id, role, topic, total_questions) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [userId, role, topic, totalQ]
            );
            const sessionId = sessionRes.rows[0].id;

            for (let i = 0; i < totalQ; i++) {
                const q = generatedData.questions[i];
                await client.query(
                    `INSERT INTO practice_questions (session_id, question_text, options, answer_index, explanation, order_index)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [sessionId, q.question, JSON.stringify(q.options), q.answerIndex, q.explanation, i]
                );
            }
            
            await client.query('COMMIT');
            res.json({ success: true, session_id: sessionId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Practice Generation Error:', err);
        res.status(500).json({ error: 'Failed to generate practice session' });
    }
});

// POST /api/practice/:id/submit - Submit an answer
router.post('/:id/submit', async (req, res) => {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { question_id, selected_option } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verify session ownership
            const sessionCheck = await client.query(
                `SELECT status, total_questions FROM practice_sessions WHERE id = $1 AND user_id = $2`,
                [sessionId, userId]
            );
            if (sessionCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Session not found' });
            }

            // Get question and verify it belongs to session
            const questionCheck = await client.query(
                `SELECT answer_index, explanation FROM practice_questions WHERE id = $1 AND session_id = $2`,
                [question_id, sessionId]
            );
            
            if (questionCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Question not found in this session' });
            }

            const isCorrect = (questionCheck.rows[0].answer_index === selected_option);
            
            // Upsert answer (idempotent submission)
            const insertAnswer = await client.query(
                `INSERT INTO practice_answers (session_id, question_id, selected_option, is_correct)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (session_id, question_id) DO NOTHING
                 RETURNING id`,
                [sessionId, question_id, selected_option, isCorrect]
            );

            // Update session score and status if it was a new answer
            if (insertAnswer.rows.length > 0) {
                // Check if all questions are answered
                const ansCountRes = await client.query(`SELECT COUNT(*) as count FROM practice_answers WHERE session_id = $1`, [sessionId]);
                const answeredCount = parseInt(ansCountRes.rows[0].count);
                const totalCount = sessionCheck.rows[0].total_questions;
                
                let newStatus = 'active';
                if (answeredCount >= totalCount) newStatus = 'completed';
                
                let scoreDelta = isCorrect ? 1 : 0;
                
                await client.query(
                    `UPDATE practice_sessions SET score = score + $1, status = $2, updated_at = NOW() WHERE id = $3`,
                    [scoreDelta, newStatus, sessionId]
                );
            }

            await client.query('COMMIT');
            
            res.json({ 
                success: true, 
                is_correct: isCorrect,
                correct_index: questionCheck.rows[0].answer_index,
                explanation: questionCheck.rows[0].explanation
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Submit answer error:', err);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

module.exports = router;
