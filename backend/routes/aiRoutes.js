const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const pool = require('../config/db');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
    try {
        const { message, context, role } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const isProjectContext = context?.type === 'project';
        
        let systemPrompt = '';

        if (isProjectContext) {
             systemPrompt = `You are an expert Senior Software Engineer and Mentor helping a user build a portfolio project.
             
             Current Project: ${context.projectTitle}
             Current Task: ${context.currentTask}
             Role Target: ${role || 'Software Engineer'}

             Your goal is to be a "Pair Programmer":
             1. Explain the current task concepts clearly.
             2. If the user asks for code, provide clean, commented, production-ready snippets impacting the specific task.
             3. If the user shares an error, debug it precisely.
             4. Do NOT just give the answer—explain WHY so they learn.
             
             Keep responses focused on the immediate task unless asked otherwise.`;
        } else {
             systemPrompt = `You are an expert AI Career Mentor and Technical Tutor specializing in ${role || 'Software Engineering'}.
        
            The user is currently viewing a learning roadmap.
            Context provided by the user: "${context?.description || context || 'No specific context'}".
            
            Your goal is to:
            1. Answer the user's question clearly and concisely.
            2. If they are asking about a specific resource or topic mentioned in the context, explain it simply.
            3. Provide practical examples if applicable.
            
            Be encouraging, professional, and helpful.`;
        }

        const requestOptions = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 2500,
            temperature: 0.7,
        };

        if (req.body.responseFormat === 'json' || message.includes('Format exactly as JSON')) {
            requestOptions.response_format = { type: "json_object" };
        }

        const completion = await openai.chat.completions.create(requestOptions);

        const reply = completion.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

router.post('/guide', async (req, res) => {
    try {
        const { message, context, role } = req.body;

        if (!message || !context?.projectTitle || !context?.currentTask) {
            return res.status(400).json({ error: 'Missing required fields for guide generation' });
        }

        const projectTitle = context.projectTitle;
        const taskText = context.currentTask;

        // 1. Check if guide exists in DB
        const dbRes = await pool.query(
            'SELECT guide_data FROM task_guides WHERE project_title = $1 AND task_text = $2',
            [projectTitle, taskText]
        );

        if (dbRes.rows.length > 0) {
            console.log(`[Cache Hit] Serving guide for task: "${taskText}"`);
            return res.json({ reply: JSON.stringify(dbRes.rows[0].guide_data) });
        }

        console.log(`[Cache Miss] Generating new guide for task: "${taskText}"`);

        // 2. Generate brand new guide
        const systemPrompt = `You are an expert Senior Software Engineer and Mentor helping a user build a portfolio project.
             
             Current Project: ${projectTitle}
             Current Task: ${taskText}
             Role Target: ${role || 'Software Engineer'}

             Your goal is to be a "Pair Programmer":
             1. Explain the current task concepts clearly.
             2. Provide a step-by-step guide to complete this specific task.
             3. Include clean, commented, production-ready code snippets where helpful.
             4. Provide Tips and Troubleshooting advice.
             
             You MUST return your response as a valid JSON object with the following schema:
             {
               "title": "Clear title for the task",
               "overview": "Brief overview of what will be done and why",
               "steps": [
                 {
                   "title": "Step title",
                   "description": "Detailed explanation of this step",
                   "code": "Optional code block or command for this step (or null)"
                 }
               ],
               "tips": ["Pro tip 1", "Pro tip 2"],
               "troubleshooting": ["Common issue 1 and solution", "Common issue 2"]
             }`;

        const requestOptions = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 2500,
            temperature: 0.7,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;

        // Extract JSON
        const match = reply.match(/\{[\s\S]*\}/);
        const parsed = match ? JSON.parse(match[0]) : null;

        if (parsed) {
            // 3. Save generated JSON into DB for next time
            try {
                await pool.query(
                    'INSERT INTO task_guides (project_title, task_text, guide_data) VALUES ($1, $2, $3) ON CONFLICT (project_title, task_text) DO NOTHING',
                    [projectTitle, taskText, JSON.stringify(parsed)]
                );
            } catch(dbErr) {
                console.error("Failed to cache guide to DB:", dbErr);
            }
        }

        res.json({ reply });
    } catch (error) {
        console.error('AI Guide Error:', error);
        res.status(500).json({ error: 'Failed to generate guide' });
    }
});

module.exports = router;
