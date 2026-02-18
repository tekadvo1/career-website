const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

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

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const reply = completion.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

module.exports = router;
