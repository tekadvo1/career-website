const express = require('express');
const router = express.Router();

// POST /api/resources/search - AI-powered resource search
router.post('/search', async (req, res) => {
  const { query, role } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key missing' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an educational content curator. Provide high-quality, up-to-date learning resources for technology and career development.'
          },
          {
            role: 'user',
            content: `Find 8 high-quality learning resources (courses, videos, documentation, books) for: "${query}". 
            Context: User is a "${role || 'Learner'}".
            
            Return ONLY a valid JSON array with this structure:
            [
              {
                "id": "generated_1",
                "title": "Resource Title",
                "description": "Brief description",
                "type": "course/video/documentation/book/interactive",
                "category": "Topic Category",
                "url": "Actual URL or Homepage URL",
                "platform": "Udemy/Coursera/YouTube/etc",
                "duration": "Duration (e.g. 10 hours)",
                "level": "Beginner/Intermediate/Advanced",
                "free": boolean,
                "rating": 4.5,
                "topics": ["topic1", "topic2"],
                "language": "English"
              }
            ]
            Prioritize specific, well-known resources.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('OpenAI API failure');

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON safely
    const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const resources = JSON.parse(jsonStr.replace(/```json|```/g, ''));

    // Ensure IDs are unique
    const labeledResources = resources.map((r, i) => ({ ...r, id: `ai_${Date.now()}_${i}` }));

    res.json({ success: true, resources: labeledResources });

  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ error: 'Failed to search resources' });
  }
});

// POST /api/resources/create-course - Generate a structured course curriculum
router.post('/create-course', async (req, res) => {
  const { topic, level } = req.body;

  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum designer. Create structured, step-by-step learning paths.'
          },
          {
            role: 'user',
            content: `Create a comprehensive learning path/course syllabus for "${topic}" at "${level || 'Intermediate'}" level.
            
            Return JSON:
            {
              "title": "Course Title",
              "description": "Course Overview",
              "totalDuration": "e.g. 4 weeks",
              "modules": [
                {
                  "title": "Module 1 Title",
                  "description": "What users will learn",
                  "topics": ["topic A", "topic B"],
                  "resources": [
                    { "title": "Recommended Resource", "url": "URL", "type": "video/article" }
                  ]
                }
              ]
            }`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const course = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    res.json({ success: true, course });

  } catch (error) {
    console.error('Course Creation Error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

module.exports = router;
