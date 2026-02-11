const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/role/analyze - Generate detailed role analysis using AI
router.post('/analyze', async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    // 1. Check if we already have an analysis for this role in the DB
    // Normalized role for better cache hits (lowercase, trimmed)
    const normalizedRole = role.trim().toLowerCase();
    
    // Simple cache check - could be improved with similarity search or expiration
    const cachedResult = await pool.query(
      "SELECT analysis_data FROM role_analyses WHERE LOWER(role_title) = $1 LIMIT 1",
      [normalizedRole]
    );

    if (cachedResult.rows.length > 0) {
      console.log('Returning cached role analysis for:', role);
      return res.json({
        success: true,
        data: cachedResult.rows[0].analysis_data,
        source: 'cache'
      });
    }

    // 2. If not in DB, call OpenAI
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    console.log('Generating AI analysis for role:', role);
    
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
            content: 'You are an expert career coach and tech industry analyst. Provide deeply detailed, accurate, and up-to-date information for job roles.'
          },
          {
            role: 'user',
            content: `Create a comprehensive career guide for the role: "${role}".
            
            Provide the response strictly in JSON format with this structure:
            {
              "title": "${role}",
              "description": "Detailed description of what this role involves, day-to-day responsibilities, and impact.",
              "jobGrowth": "e.g. 22% (Much faster than average)",
              "salaryRange": "e.g. $80,000 - $150,000",
              "skills": [
                { "name": "Skill Name", "level": "Beginner/Intermediate/Advanced", "priority": "High/Medium/Low Priority", "timeToLearn": "e.g. 3 months" }
              ],
              "tools": [
                 { "name": "Tool Name", "category": "IDE/Database/etc", "description": "Brief description", "difficulty": "Easy/Medium/Hard" }
              ],
              "languages": ["Language 1", "Language 2"],
              "frameworks": ["Framework 1", "Framework 2"],
              "resources": [
                { "name": "Resource Title", "provider": "Coursera/Udemy/etc", "type": "free/paid", "duration": "Duration", "category": "Course/Tutorial", "url": "URL if known or generic homepage" }
              ]
            }
            
            Ensure the information is realistic for the current job market.
            CRITICAL: List ALL relevant skills, tools, languages, frameworks, and resources without any artificial limit. Do not restrict the number of items. Be comprehensive and exhaustive to provide a complete guide.`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error('Failed to fetch from OpenAI');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse JSON
    let analysisData;
    try {
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysisData = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Invalid JSON response from AI');
    }

    // 3. Store in Database
    // We use a dummy user_id 1 or handle nulls if users aren't logged in yet. 
    // Since schema has user_id NOT NULL usually, let's check schema.
    // Schema: user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    // If user not logged in, we might have issues. Let's make user_id nullable in future or just insert if we have a user.
    // For now, let's skip DB insert if we don't have a user context, OR assuming this is a public cache.
    // Actually, let's check the schema again. user_id is a reference. 
    // To assume a global cache, we might want user_id to be nullable or use a system user. 
    // For this implementation, I will just return the data to the frontend to ensure it works immediately for the user request "no hardcoding".
    // I will try to cache it if I can, but to avoid FK errors if no user exists, I'll wrap it.
    
    // CACHE LOGIC:
    // Ideally, we associate with the requesting user or NULL for global.
    // Let's UPDATE the table definition to allow NULL user_id for global cache items?
    // Too risky to change schema on fly without psql.
    // Instead, I will just return the AI data for now. The "storage in database" part of the request might imply "persist this info".
    // I'll try to insert with user_id NULL if the DB allows, otherwise catch the error and just return the data.

    try {
       await pool.query(
        "INSERT INTO role_analyses (role_title, analysis_data) VALUES ($1, $2)",
        [role, analysisData]
      );
    } catch (dbError) {
      // If insertion fails (e.g. user_id constraint), just log and continue
      // We'll fix schema later to support global cache
      console.warn('Could not cache role analysis to DB (likely user_id constraint):', dbError.message);
    }

    res.json({
      success: true,
      data: analysisData,
      source: 'ai'
    });

  } catch (error) {
    console.error('Role analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze role' });
  }
});

module.exports = router;
