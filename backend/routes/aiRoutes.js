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

        const systemPrompt = `You are an expert AI Career Mentor and Technical Tutor specializing in ${role || 'Software Engineering'}.
        
        The user is currently viewing a learning roadmap.
        Context provided by the user: "${context || 'No specific context'}".
        
        Your goal is to:
        1. Answer the user's question clearly and concisely.
        2. If they are asking about a specific resource or topic mentioned in the context, explain it simply.
        3. Provide practical examples if applicable.
        4. Kepp your response under 200 words unless detailed explanation is requested.
        
        Be encouraging, professional, and helpful.`;

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
