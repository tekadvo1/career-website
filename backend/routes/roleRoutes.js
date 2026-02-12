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
        const cachedData = userCache.rows[0].analysis_data;
        // Only Use cache if it has the new roadmap structure
        if (cachedData.roadmap && Array.isArray(cachedData.roadmap)) {
          console.log(`Returning cache for user ${userId}: ${normalizedRole}`);
          return res.json({
            success: true,
            data: cachedData,
            source: 'database'
          });
        }
        console.log(`Cache found but missing roadmap, regenerating for: ${normalizedRole}`);
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
            1. Provide a "roadmap" array that covers the entire journey from Beginner to Expert.
            2. The roadmap MUST be exhaustive. Do not limit the number of phases or items.
            3. "resources" MUST include REAL, VALID URLs (e.g., official docs, popular courses on Coursera/Udemy/edX/YouTube, or GitHub repos). Do not use placeholder links.
            4. "projects" should be concrete and build a portfolio.

            Return valid JSON with this EXACT structure:
            {
              "title": "${role}",
              "description": "Detailed role description.",
              "jobGrowth": "Market growth in ${country}",
              "salaryRange": "Salary range in ${country}",
              "skills": [
                { "name": "Skill Name", "level": "Beginner/Intermediate/Advanced", "priority": "High", "timeToLearn": "e.g. 2 weeks" }
              ],
              "extra_sections": {
                 "tools": [{ "name": "Tool", "category": "Type", "difficulty": "Easy/Hard" }],
                 "languages": ["Lang 1", "Lang 2"],
                 "frameworks": ["Frame 1", "Frame 2"]
              },
              "roadmap": [
                {
                  "phase": "Phase Name (e.g., Foundations)",
                  "duration": "e.g., 4 weeks",
                  "difficulty": "Beginner/Intermediate/Advanced",
                  "description": "Goal of this phase",
                  "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
                  "skills_covered": ["Skill A", "Skill B"],
                  "resources": [
                    { "name": "Resource Title", "url": "https://active-link.com", "type": "Course/Video/Article", "is_free": true }
                  ],
                  "projects": [
                    { "name": "Project Name", "description": "What to build", "difficulty": "Easy/Medium/Hard" }
                  ]
                }
              ]
            }
          `
        }
      ],
      temperature: 0.4,
      max_tokens: 4000
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
    const jsonText = jsonMatch ? jsonMatch[1] : analysisText; // If no match, try parsing the whole text
    analysisData = JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    // If exact parsing fails, try to find the first '{' and last '}'
    const startIndex = analysisText.indexOf('{');
    const endIndex = analysisText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
       try {
          analysisData = JSON.parse(analysisText.substring(startIndex, endIndex + 1));
       } catch (e2) {
          throw new Error('Invalid JSON response from AI');
       }
    } else {
       throw new Error('Invalid JSON response from AI');
    }
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
