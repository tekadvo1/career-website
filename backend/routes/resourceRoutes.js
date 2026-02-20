const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper to seed initial data if empty
const seedResourcesIfEmpty = async () => {
  try {
    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        resource_type VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        url TEXT NOT NULL UNIQUE,
        platform VARCHAR(100),
        duration VARCHAR(100),
        level VARCHAR(50),
        free BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3, 1),
        topics TEXT[],
        language VARCHAR(50) DEFAULT 'English',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const countResult = await pool.query('SELECT COUNT(*) FROM resources');
    const count = parseInt(countResult.rows[0].count);

    if (count > 0) return;

    console.log('Seeding resources database with AI...');
    
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    const topics = ["JavaScript", "React", "Python", "Data Structure", "Machine Learning", "System Design"];
    
    // Generate resources for each topic in parallel
    const promises = topics.map(async (topic) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a curator of technical learning resources.' },
                    { role: 'user', content: `Generate 3 high-quality learning resources (1 course, 1 video, 1 documentation) for "${topic}". 
                      Return ONLY a JSON array:
                      [{
                        "title": "Title",
                        "description": "Desc",
                        "resource_type": "course/video/documentation",
                        "category": "${topic}",
                        "url": "https://example.com",
                        "platform": "Platform Name",
                        "duration": "e.g. 10h",
                        "level": "Beginner/Intermediate",
                        "free": true,
                        "rating": 4.8,
                        "topics": ["${topic}"],
                        "language": "English"
                      }]` 
                    }
                ],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/```json\n([\s\S]*?)\n```/);
        const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : '[]';
        return JSON.parse(jsonStr);
    });

    const results = await Promise.all(promises);
    const resources = results.flat();

    for (const r of resources) {
        await pool.query(`
            INSERT INTO resources (title, description, resource_type, category, url, platform, duration, level, free, rating, topics, language)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (url) DO NOTHING
        `, [r.title, r.description, r.resource_type, r.category, r.url, r.platform, r.duration, r.level, r.free, r.rating, r.topics, r.language]);
    }
    console.log(`Seeded ${resources.length} resources.`);

  } catch (e) {
    console.error("Seeding failed", e);
  }
};

// GET /api/resources - Get all resources (with auto-seed)
router.get('/', async (req, res) => {
    try {
        await seedResourcesIfEmpty(); // Auto-seed if needed
        
        const result = await pool.query('SELECT * FROM resources ORDER BY rating DESC, created_at DESC LIMIT 100');
        res.json({ success: true, resources: result.rows });
    } catch (error) {
        console.error('Fetch Resources Error:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

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
            content: 'You are an advanced AI research assistant with access to real-time web search capabilities. Your goal is to find the most current, high-quality learning resources available online as of 2024/2025.'
          },
          {
            role: 'user',
            content: `Perform a comprehensive web search for the latest and most highly-rated learning resources (courses, videos, documentation, books) for: "${query}". 
            Context: User is a "${role || 'Learner'}".
            
            Focus on finding resources that are:
            1. Up-to-date (released or updated in 2024/2025).
            2. Highly rated by the community.
            3. From reputable platforms (e.g., Coursera, Udemy, YouTube, Official Docs).
            
            Return ONLY a valid JSON array with this structure:
            [
              {
                "id": "generated_1",
                "title": "Resource Title",
                "description": "Brief description highlighting why it's recommended",
                "resource_type": "course/video/documentation/book/interactive",
                "category": "Topic Category",
                "url": "Actual URL",
                "platform": "Platform Name",
                "duration": "Duration",
                "level": "Beginner/Intermediate/Advanced",
                "free": boolean,
                "rating": 4.8,
                "topics": ["topic1", "topic2"],
                "language": "English"
              }
            ]
            Prioritize freshness and quality.`
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

    // Ensure IDs are unique AND Save to DB for caching/future use
    const labeledResources = [];
    
    for (const r of resources) {
         try {
             const saved = await pool.query(`
                INSERT INTO resources (title, description, resource_type, category, url, platform, duration, level, free, rating, topics, language)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (url) DO UPDATE SET title=$1 RETURNING id
             `, [r.title, r.description, r.resource_type || r.type, r.category, r.url, r.platform, r.duration, r.level, r.free, r.rating, r.topics, r.language]);
             
             labeledResources.push({ ...r, id: saved.rows[0]?.id || `ai_${Date.now()}` });
         } catch(e) {
             console.log("Error saving searched resource", e);
             labeledResources.push({ ...r, id: `ai_${Date.now()}` });
         }
    }

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
            content: 'You are an expert curriculum designer with access to the latest educational standards and industry trends. Create a modern, up-to-date learning path.'
          },
          {
            role: 'user',
            content: `Create a comprehensive, 2025-ready learning path/course syllabus for "${topic}" at "${level || 'Intermediate'}" level.
            
            Ensure the curriculum reflects the latest tools, versions, and best practices.
            
            Return JSON:
            {
              "title": "Modern Course Title",
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


// POST /api/resources/save-course - Save a generated course
router.post('/save-course', async (req, res) => {
  const { title, courseData, userId } = req.body;

  if (!courseData) return res.status(400).json({ error: 'Course data is required' });

  try {
    // For now, allow saving without user_id (anonymous) or use provided ID
    // Ideally use req.user.id from auth middleware
    const query = `
      INSERT INTO user_courses (user_id, title, course_data)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [userId || null, title || 'My Course', courseData];
    
    // Note: user_id references users(id). If userId is null, schemas usually allow it if not NOT NULL.
    // If schema enforces NOT NULL, we need a valid user. 
    // Given previous schema update for role_analyses allowed NULL, let's assume we can try null here too.
    // Wait, my CREATE TABLE above didn't specify NOT NULL for user_id, so it defaults to nullable.
    
    const result = await pool.query(query, values);
    res.json({ success: true, course: result.rows[0] });
  } catch (error) {
    console.error('Save Course Error:', error);
    res.status(500).json({ error: 'Failed to save course' });
  }
});

// GET /api/resources/my-courses - Get saved courses
router.get('/my-courses', async (req, res) => {
  const { userId } = req.query;
  
  try {
    // Determine query based on user existence
    let query, values;
    if (userId) {
       query = 'SELECT * FROM user_courses WHERE user_id = $1 ORDER BY created_at DESC';
       values = [userId];
    } else {
       // If no user, maybe fetch recently created public/anonymous ones? Or just empty.
       // For demo, let's return latest 10 anonymous courses
       query = 'SELECT * FROM user_courses WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 10';
       values = [];
    }
    
    const result = await pool.query(query, values);
    res.json({ success: true, courses: result.rows });
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

module.exports = router;
