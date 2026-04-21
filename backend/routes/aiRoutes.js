const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const pool = require('../config/db');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { checkAICredits } = require('../middleware/creditMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', checkAICredits, async (req, res) => {
    try {
        const { message, context, role, conversationHistory } = req.body;

        const isProjectContext = context?.type === 'project';

        let systemPrompt = '';

        if (isProjectContext) {
            systemPrompt = `You are FindStreak AI — an expert Senior Software Engineer and Pair Programmer mentoring a user on a real portfolio project.

Project: ${context.projectTitle}
Current Task: ${context.currentTask}
Target Role: ${role || 'Software Engineer'}

Your approach:
- Guide without just handing over answers. Explain the WHY behind every solution.
- When the user shares code or an error, debug it precisely and explain what went wrong.
- Provide clean, production-ready code examples when asked.
- Be direct and technical. Reference earlier parts of the conversation naturally.`;
        } else {
            systemPrompt = `You are FindStreak AI — an expert career mentor and technical assistant specialising in ${role || 'Software Engineering'}.

Your personality:
- Direct, knowledgeable, and encouraging — like a senior engineer who genuinely wants to help
- Conversational and natural, never robotic or overly formal
- Real, specific, actionable answers — never vague filler

Your capabilities:
- Career guidance, role transitions, and skill gap analysis for ${role || 'Software Engineering'}
- Technical explanations, code reviews, debugging help
- Interview preparation, resume advice, project strategy
- Learning roadmap guidance and resource recommendations

Rules:
- Remember and reference earlier parts of the conversation — never repeat context already given
- Be specific. If asked for code, provide clean working examples with explanations.
- Use markdown: headers, bullets, and code blocks where it helps clarity.
- Stay focused on career and technical topics related to ${role || 'Software Engineering'}.`;
        }

        // Build full message array with conversation history — like ChatGPT
        const messages = [{ role: 'system', content: systemPrompt }];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            // Send last 20 messages to stay within token limits
            const recent = conversationHistory.slice(-20);
            for (const msg of recent) {
                if (msg.type === 'user' && msg.content) {
                    messages.push({ role: 'user', content: msg.content });
                } else if (msg.type === 'assistant' && msg.content) {
                    messages.push({ role: 'assistant', content: msg.content });
                }
            }
        } else {
            messages.push({ role: 'user', content: message });
        }

        const requestOptions = {
            model: 'gpt-4o',
            messages,
            max_tokens: 2500,
            temperature: 0.7,
        };

        if (req.body.responseFormat === 'json') {
            requestOptions.response_format = { type: 'json_object' };
        }

        if (req.body.stream) {
            requestOptions.stream = true;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            try {
                const stream = await openai.chat.completions.create(requestOptions);
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                }
                res.write(`data: [DONE]\n\n`);
                return res.end();
            } catch (err) {
                console.error('Streaming error:', err);
                res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
                return res.end();
            }
        }

        const completion = await openai.chat.completions.create(requestOptions);
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

router.post('/guide', checkAICredits, async (req, res) => {
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
            model: "gpt-4o",
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

// GET /api/ai/chat-history - Sync user's previous chats from mobile/desktop
router.get('/chat-history', async (req, res) => {
    const { userId, role } = req.query;
    if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
    }

    try {
        const result = await pool.query(
            "SELECT id, title, messages, updated_at FROM chat_sessions WHERE user_id = $1 AND role = $2 ORDER BY updated_at DESC",
            [userId, role]
        );
        
        const history = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            messages: typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages,
            updatedAt: row.updated_at
        }));

        res.json({ success: true, history });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// POST /api/ai/chat-history - Push changes from frontend client to persistent DB
router.post('/chat-history', async (req, res) => {
    const { userId, role, chatHistory } = req.body;
    if (!userId || !role || !Array.isArray(chatHistory)) {
        return res.status(400).json({ error: 'userId, role, and chatHistory array are required' });
    }

    try {
        const client = await pool.connect();
        await client.query('BEGIN');
        
        // Upsert sessions for this role
        for (const session of chatHistory) {
             const messagesObj = JSON.stringify(session.messages);
             const updatedAt = new Date(session.updatedAt || Date.now());
             await client.query(`
                INSERT INTO chat_sessions (id, user_id, title, messages, updated_at, role) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, messages = EXCLUDED.messages, updated_at = EXCLUDED.updated_at, role = EXCLUDED.role
             `, [session.id, userId, session.title, messagesObj, updatedAt, role]);
        }
        
        // Delete sessions for THIS ROLE that are no longer in the client list
        if (chatHistory.length > 0) {
            const currentIds = chatHistory.map(c => c.id);
            await client.query('DELETE FROM chat_sessions WHERE user_id = $1 AND role = $2 AND id != ALL($3)', [userId, role, currentIds]);
        } else {
            await client.query('DELETE FROM chat_sessions WHERE user_id = $1 AND role = $2', [userId, role]);
        }

        await client.query('COMMIT');
        client.release();
        res.json({ success: true, message: 'Chat history synchronized successfully' });
    } catch (err) {
        console.error('Chat history sync error:', err);
        res.status(500).json({ error: 'Failed to synchronize chats' });
    }
});

// POST /api/ai/generate-quiz - Generates real-time quizzes based on role and topic
router.post('/generate-quiz', checkAICredits, async (req, res) => {
    try {
        const { role, topic } = req.body;
        
        let systemPrompt = `You are an expert ${role || 'Software Engineering'} Technical Interviewer and Game Master.
        
        The user wants to play a trivia game to test their knowledge on the topic: "${topic || 'General coding'}".
        You MUST generate exactly 5 multiple-choice questions. 
        Make them fun, engaging, and suitable for someone actively learning the topic.
        
        You MUST return your response as a valid JSON object matching this schema exactly:
        {
          "questions": [
            {
              "question": "The question text?",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "answerIndex": 0, // In this example, "Option 1" is correct (0-indexed)
              "explanation": "Why this is correct."
            }
          ]
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [{ role: "system", content: systemPrompt }],
            max_tokens: 1500,
            temperature: 0.8,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;
        
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error('Quiz Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// POST /api/ai/generate-resume-quiz - Generates real-time quizzes based on an uploaded Resume and Role
router.post('/generate-resume-quiz', checkAICredits, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });
        
        const role = req.body.role || 'Software Engineering';
        const topic = req.body.topic || 'General coding';
        
        let resumeText = '';
        if (req.file.mimetype === 'application/pdf') {
             const pdfData = await pdfParse(req.file.buffer);
             resumeText = pdfData.text;
        } else {
             resumeText = req.file.buffer.toString('utf-8'); // Fallback for simple text/docx if necessary (though simplified here)
        }
        
        // Truncate if too long to save tokens
        if (resumeText.length > 3000) resumeText = resumeText.substring(0, 3000);

        let systemPrompt = `You are an expert ${role} Technical Interviewer.
        
        The user has uploaded their resume and wants to test their knowledge on: "${topic}".
        First, analyze their resume briefly to identify their skill level and missing gaps. 
        Then, generate exactly 5 multiple-choice questions dynamically tailored to cross-examine their resume strengths OR test them on critical concepts missing from their resume for the ${role} role.
        
        Make them fun, engaging, and highly personalized!
        
        You MUST return your response as a valid JSON object matching this schema exactly:
        {
          "questions": [
            {
              "question": "The question text?",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "answerIndex": 0,
              "explanation": "Why this is correct."
            }
          ]
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is my Resume Text:\n\n${resumeText}\n\nPlease generate the trivia game.` }
            ],
            max_tokens: 1500,
            temperature: 0.8,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;
        
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error('Resume Quiz Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate resume quiz' });
    }
});

// POST /api/ai/generate-interview-guide - Generates an interview guide (Q&A and tips)
router.post('/generate-interview-guide', checkAICredits, upload.single('resume'), async (req, res) => {
    try {
        const role = req.body.role || 'Software Engineering';
        const notes = req.body.notes || ''; // Optional context or specific topics the user wants
        const existingQsRaw = req.body.existingQuestions;
        let existingQuestions = [];
        try { if (existingQsRaw) existingQuestions = JSON.parse(existingQsRaw); } catch(e){}
        
        let resumeText = '';
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                 const pdfData = await pdfParse(req.file.buffer);
                 resumeText = pdfData.text;
            } else {
                 resumeText = req.file.buffer.toString('utf-8');
            }
            if (resumeText.length > 3000) resumeText = resumeText.substring(0, 3000);
        }

        let systemPrompt = `You are an expert ${role} Technical Interviewer and Career Coach.
        
        The user wants an interview guide to prepare for a ${role} position.
        ${resumeText ? 'The user has uploaded their resume. Base the questions entirely around scrutinizing their actual experience, missing gaps, and the role.' : 'No resume was provided, so provide foundational and advanced questions for this role.'}
        ${notes ? `The user also mentioned they specifically want to focus on: "${notes}".` : ''}
        ${existingQuestions.length > 0 ? `CRITICAL: Do NOT generate or repeat any of the following questions: ${JSON.stringify(existingQuestions)}` : ''}
        
        Generate exactly 5 highly relevant interview questions. For each question provide:
        1. The Question.
        2. A "Great Answer" example or structure.
        3. A "Pro Tip" for how to stand out when answering this.
        
        You MUST return your response as a valid JSON object matching this schema exactly:
        {
          "guide": [
            {
              "question": "The question text?",
              "answer": "A great answer example.",
              "tip": "How to stand out."
            }
          ],
          "generalTips": ["Overall tip 1", "Overall tip 2"]
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: resumeText ? `Here is my Resume Text:\n\n${resumeText}\n\nPlease generate the interview guide.` : `Please generate the interview guide.` }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;
        
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error('Interview Guide Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate interview guide' });
    }
});

// GET /api/ai/interview-guides - Fetch saved interview guide and help
router.get('/interview-guides', async (req, res) => {
    const { userId, role } = req.query;
    if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
    }

    try {
        const result = await pool.query(
            "SELECT guide_data, question_help FROM interview_guides WHERE user_id = $1 AND role = $2",
            [userId, role]
        );
        if (result.rows.length > 0) {
            res.json({
                success: true,
                guideData: typeof result.rows[0].guide_data === 'string' ? JSON.parse(result.rows[0].guide_data) : result.rows[0].guide_data,
                questionHelp: typeof result.rows[0].question_help === 'string' ? JSON.parse(result.rows[0].question_help) : result.rows[0].question_help
            });
        } else {
            res.json({ success: true, guideData: null, questionHelp: {} });
        }
    } catch (err) {
        console.error('Error fetching interview guide:', err);
        res.status(500).json({ error: 'Failed to fetch interview guide' });
    }
});

// POST /api/ai/interview-guides - Save or update interview guide and help
router.post('/interview-guides', async (req, res) => {
    const { userId, role, guideData, questionHelp } = req.body;
    if (!userId || !role) {
        return res.status(400).json({ error: 'userId and role are required' });
    }

    try {
        await pool.query(
            `INSERT INTO interview_guides (user_id, role, guide_data, question_help)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, role) DO UPDATE SET 
             guide_data = EXCLUDED.guide_data, 
             question_help = EXCLUDED.question_help,
             updated_at = CURRENT_TIMESTAMP`,
            [userId, role, JSON.stringify(guideData || {}), JSON.stringify(questionHelp || {})]
        );
        res.json({ success: true, message: 'Interview guide saved successfully' });
    } catch (err) {
        console.error('Error saving interview guide:', err);
        res.status(500).json({ error: 'Failed to save interview guide' });
    }
});

// POST /api/ai/mock-interview-evaluate - Evaluates an answer and provides a score and feedback
router.post('/mock-interview-evaluate', async (req, res) => {
    try {
        const { question, answer, role, expectedAnswer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ error: 'Question and answer are required' });
        }

        const systemPrompt = `You are an expert ${role || 'Software Engineering'} Technical Interviewer and Hiring Manager.
        
        The user is doing a mock interview.
        Question asked: "${question}"
        User's answer: "${answer}"
        Ideal answer structure based on their resume/role: "${expectedAnswer || 'Not provided'}"

        Your task is to evaluate the user's answer. 
        1. Give a score out of 100 based on clarity, correctness, and completeness.
        2. Provide short, constructive feedback (2-3 sentences max). Suggest how they can improve or what they missed.
        
        You MUST return your response as a valid JSON object matching this schema exactly:
        {
            "score": 85,
            "feedback": "You explained X well, but missed Y. A complete answer would also mention Z."
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [{ role: "system", content: systemPrompt }],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;
        
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error('Mock Evaluate Error:', error);
        res.status(500).json({ error: 'Failed to evaluate answer' });
    }
});

// POST /api/ai/tech-stack - Generates trending tech stack based on role and resume
router.post('/tech-stack', checkAICredits, upload.single('resume'), async (req, res) => {
    try {
        const role = req.body.role || 'Software Engineering';
        
        let resumeText = '';
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                 const pdfData = await pdfParse(req.file.buffer);
                 resumeText = pdfData.text;
            } else {
                 resumeText = req.file.buffer.toString('utf-8');
            }
            if (resumeText.length > 3000) resumeText = resumeText.substring(0, 3000);
        }

        let systemPrompt = `You are an expert ${role} Manager and Tech Lead.
        
        The user wants a highly detailed, comprehensive, and up-to-date breakdown of the exact Tech Stack, Tools, and Frameworks they need to learn and use for a "${role}" position right now. 
        ${resumeText ? 'The user has uploaded their resume. Thoroughly analyze their existing skills. Skip basic foundational skills they already have, and focus strictly on advanced, modern, or trending alternatives to level up their career.' : 'No resume was provided. Provide a comprehensive modern stack from scratch.'}
        
        CRITICAL INSTRUCTION: Analyze if the role "${role}" actually requires programming or coding. 
        If the role is NON-TECHNICAL (e.g. HR, Sales, Project Manager, Marketing, UI/UX Designer, purely operational roles, etc.), DO NOT return any programming languages or frameworks. Instead, return EMPTY arrays for 'languages' and 'frameworks', and ONLY return software tools, SaaS products, platforms, and methodologies relevant to their role in the 'tools' array.
        If the role IS technical and requires coding, provide specific programming languages, frameworks, and tools.
        
        Please act as an AI with web search capabilities and provide the absolute latest, industry-standard, and rapidly trending technologies. DO NOT give generic answers; give specific tools (e.g., if technical: "Docker", "Kubernetes", "Next.js", if non-technical: "Salesforce", "Figma", "Jira", "HubSpot", "Tableau"). For every item, provide a very detailed explanation of why it is used professionally.
        
        You MUST return your response as a valid JSON object matching this schema exactly:
        {
          "languages": [
            { "name": "Language Name", "reason": "Detailed explanation of why this language is critical for professional use.", "status": "Trending or Core" }
          ],
          "frameworks": [
             { "name": "Framework Name", "reason": "Deep dive into what problems this framework solves structurally.", "status": "Industry Standard" }
          ],
          "tools": [
             { "name": "Tool Name", "reason": "Explicit justification for this tool in a production workflow.", "category": "Category type (e.g. CI/CD, CRM, Design, Analytics)" }
          ],
          "trending": ["Rapidly growing tech 1", "Rapidly growing tech 2"],
          "summary": "A comprehensive 3-sentence summary of what their strategic learning priority should be."
        }`;

        const requestOptions = {
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: resumeText ? `Here is my Resume Text:\n\n${resumeText}\n\nPlease recommend a highly detailed tech stack.` : `Please recommend the latest and highly detailed tech stack.` }
            ],
            max_tokens: 2500,
            temperature: 0.7,
            response_format: { type: "json_object" }
        };

        const completion = await openai.chat.completions.create(requestOptions);
        const reply = completion.choices[0].message.content;
        
        res.json(JSON.parse(reply));
    } catch (error) {
        console.error('Tech Stack Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate tech stack recommendations' });
    }
});

module.exports = router;
