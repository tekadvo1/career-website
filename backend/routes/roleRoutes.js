const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/role/analyze - Generate detailed role analysis using AI
router.post('/analyze', async (req, res) => {
  const { role, userId, experienceLevel = 'Beginner', country = 'USA' } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const normalizedRole = `${role.trim().toLowerCase()} (${experienceLevel.toLowerCase()} - ${country.toLowerCase()})`;
    
    // 1. Check for existing analysis for this USER
    if (userId) {
      const userCache = await pool.query(
        "SELECT analysis_data FROM role_analyses WHERE user_id = $1 AND LOWER(role_title) = $2 LIMIT 1",
        [userId, normalizedRole]
      );

      if (userCache.rows.length > 0) {
        console.log(`Returning cache for user ${userId}: ${normalizedRole}`);
        return res.json({
          success: true,
          data: userCache.rows[0].analysis_data,
          source: 'database'
        });
      }
    }

    // 2. If no user cache, call OpenAI
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    console.log(`Generating AI analysis for: ${role} [${experienceLevel}, ${country}]`);
    
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
            content: `You are an expert career coach. Provide a structured, stable, and comprehensive career guide tailored to the specific experience level and country requested.`
          },
          {
            role: 'user',
            content: `Create a definitive career guide for the role: "${role}" at the "${experienceLevel}" level in "${country}".
            
            Provide the response strictly in JSON format with this structure:
            {
              "title": "${role}",
              "description": "Detailed description of what this role involves.",
              "jobGrowth": "Current market growth rate in ${country}",
              "salaryRange": "Realistic salary range in ${country} (use local currency)",
              "skills": [
                { "name": "Skill Name", "level": "Beginner/Intermediate/Advanced", "priority": "High/Medium", "timeToLearn": "Estimated time" }
              ],
              "tools": [
                 { "name": "Tool Name", "category": "Category", "description": "Brief description", "difficulty": "Difficulty" }
              ],
              "languages": ["Relevant Language 1", "Relevant Language 2"],
              "frameworks": ["Relevant Framework 1", "Relevant Framework 2"],
              "resources": [
                { "name": "Resource Title", "provider": "Provider", "type": "free/paid", "duration": "Duration", "category": "Course/Tutorial", "url": "URL" }
              ]
            }
            
            CRITICAL IMPERATIVE:
            List EVERYTHING a user needs to know to master this role, but Organize it logically. 
            Do not provide an "unlimited" random list. Provide the COMPLETE Recommended Path.
            Include ALL essential skills, tools, and resources required for professional competence.`
          }
        ],
        temperature: 0.3 // Lower temperature for more stable/consistent results
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

    // 3. Store in Database (Persistence)
    // If we have a userId, store it linked to them.
    // If not, we could store it globally (user_id = null) if we wanted a global cache, 
    // but the requirement is specific to "once user login... not change".
    
    if (userId) {
      try {
         await pool.query(
          "INSERT INTO role_analyses (user_id, role_title, analysis_data) VALUES ($1, $2, $3)",
          [userId, normalizedRole, analysisData]
        );
        console.log(`Saved analysis to database for user ${userId}, role: ${normalizedRole}`);
      } catch (dbError) {
        console.error('Database save failed:', dbError.message);
      }
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
