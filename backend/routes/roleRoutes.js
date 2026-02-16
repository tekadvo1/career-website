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
        
        let isModernStructure = false;
        if (cachedData.roadmap && Array.isArray(cachedData.roadmap) && cachedData.roadmap.length > 0) {
            const firstPhase = cachedData.roadmap[0];
            if (firstPhase.topics && Array.isArray(firstPhase.topics) && firstPhase.topics.length > 0) {
                // Check if the first topic is an object, not a string
                if (typeof firstPhase.topics[0] === 'object') {
                    isModernStructure = true;
                }
            }
        }

        if (isModernStructure) {
          console.log(`Returning detailed cache for user ${userId}: ${normalizedRole}`);
          return res.json({
            success: true,
            data: cachedData,
            source: 'database'
          });
        }
        console.log(`Cache found but using old structure, regenerating for: ${normalizedRole}`);
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
            content: `Create a definitive, EXHAUSTIVE, and DEEPLY EDUCATIONAL career guide for the role: "${role}" at the "${experienceLevel}" level in "${country}".
            
            Your goal is to make the user FULLY UNDERSTAND what is required and WHY. Do not hold back information. If a role requires 20 skills, list all 20. If it requires 15 tools, list all 15.
            
            Provide the response strictly in JSON format with this structure:
            {
              "title": "${role}",
              "description": "Comprehensive, multi-paragraph description of exactly what this professional does day-to-day, their responsibilities, and their impact on the business.",
              "jobGrowth": "Current market growth rate and future outlook in ${country}",
              "salaryRange": "Overview salary range in ${country}",
              
              "salary_insights": {
                 "entry_level": "e.g. $60k - $80k",
                 "senior_level": "e.g. $120k - $160k",
                 "salary_growth_potential": "High/Medium/Low",
                 "negotiation_tips": "Specific advice on how to negotiate deeper compensation for this role."
              },

              "day_in_the_life": [
                 { "time": "9:00 AM", "activity": "Standup Meeting", "description": "Discuss blockers with the team." },
                 { "time": "11:00 AM", "activity": "Deep Work", "description": "Coding core features." }
              ],

              "career_paths": [
                 { "role": "Next Step Role 1", "timeline": "2-4 years", "description": "Explanation of this transition." },
                 { "role": "Next Step Role 2", "timeline": "5+ years", "description": "Explanation of this transition." }
              ],

              "interview_prep": [
                 { "question": "Common Interview Question 1", "answer_tip": "Advice on how to answer this question effectively." },
                 { "question": "Common Interview Question 2", "answer_tip": "Advice on how to answer this question effectively." },
                 { "question": "Common Interview Question 3", "answer_tip": "Advice on how to answer this question effectively." }
              ],

              "soft_skills": [
                 { "name": "Communication", "description": "Why efficient communication is vital." },
                 { "name": "Leadership", "description": "Leading small teams or initiatives." }
              ],

              "skills": [
                { 
                  "name": "Skill Name", 
                  "level": "Beginner/Intermediate/Advanced", 
                  "priority": "High/Medium/Low", 
                  "timeToLearn": "Estimated time (e.g. 2 weeks)",
                  "reason": "CRITICAL: Explain WHY this skill is needed for this specific role. (e.g. 'Needed to build scalable APIs').",
                  "practical_application": "A specific example of how this skill is used on the job."
                }
              ],
              
              "tools": [
                 { 
                   "name": "Tool Name", 
                   "category": "Category", 
                   "difficulty": "Easy/Medium/Hard",
                   "description": "What is this tool?",
                   "usage_context": "CRITICAL: Explain exactly WHEN and HOW this tool is used. (e.g. 'Used daily for tracking bug reports in Agile teams')."
                 }
              ],
              
              "languages": [
                {
                   "name": "Language Name",
                   "description": "Brief description",
                   "usage": "CRITICAL: Explain why this language is dominant in this field. (e.g. 'Python is the industry standard for Data Science due to its rich library ecosystem')." 
                }
              ],
              
              "frameworks": [
                 {
                   "name": "Framework Name",
                   "description": "Brief description",
                   "usage": "CRITICAL: Explain why this framework is chosen over others. (e.g. 'React is preferred for its component-based architecture and huge community support')."
                 }
              ],
              
              "resources": [
                { 
                  "name": "Resource Title", 
                  "provider": "Provider Name", 
                  "type": "free/paid", 
                  "duration": "Duration", 
                  "category": "Course/Tutorial/Book", 
                  "url": "Valid URL",
                  "description": "Why is this specific resource recommended? what will they learn?"
                }
              ],

              "workflow": [
                  {
                    "stage": "Stage Name (e.g. Planning / Database Design)",
                    "description": "What happens in this stage?",
                    "tools_used": ["Tool A", "Tool B"],
                    "activities": ["Activity 1", "Activity 2"]
                  }
              ],

              "roadmap": [
                {
                  "phase": "Phase Name (e.g., Foundations)",
                  "duration": "e.g., 4 weeks",
                  "difficulty": "Beginner/Intermediate/Advanced",
                  "description": "Goal of this phase",
                  "topics": [
                     {
                       "name": "Topic Name",
                       "description": "Comprehensive explanation of this concept.",
                       "practical_application": "A specific mini-project or exercise.",
                       "subtopics": ["Sub-concept 1", "Sub-concept 2", "Sub-concept 3"],
                       "topic_resources": [
                          { "name": "Best Paid Course", "url": "https://udemy.com/...", "type": "Course", "is_free": false },
                          { "name": "Best Free Tutorial", "url": "https://youtube.com/...", "type": "Video", "is_free": true }
                       ]
                     }
                  ],
                  "skills_covered": ["Skill A", "Skill B"],
                  "step_by_step_guide": [
                      "Step 1: textual instruction...", 
                      "Step 2: textual instruction..."
                  ],
                  "projects": [
                    { "name": "Project Name", "description": "What to build", "difficulty": "Easy/Medium/Hard" }
                  ],
                  "category": "Beginner/Intermediate/Advanced"
                }
              ]
            }
            
            CRITICAL INSTRUCTIONS FOR "UNLIMITED" DEPTH:
            1. **Exhaustive Lists**: Do not forcefully limit lists. If 12 skills are essential, list 12.
            2. **"Why" is Key**: For every Skill, Tool, Language, and Framework, provide the "reason" or "usage" field.
            3. **Contextualize**: Do not just say "Java". Say "Java (Used for enterprise backend systems)".
            4. **Conditional**: If the role does not require programming languages, return an empty array [] for "languages".
            5. **Day in the Life**: BE REALISTIC. 
            6. **Salary Insights**: Provide separate entry/senior ranges.
            7. **Workflow & Lifecycle (CRITICAL)**: This must be HIGHLY TECHNICAL and SPECIFIC. 
               - If the role is "Full Stack Developer", the workflow MUST cover: Database Design (SQL/NoSQL) -> Backend API Development (Node/Python) -> Frontend Connection (React/Vue) -> Testing -> Deployment (CI/CD, AWS/Vercel).
               - Mention SPECIFIC tools in the 'tools_used' array for each stage (e.g. 'MySQL', 'Express.js', 'Postman', 'GitHub Actions').
               - Explain HOW components connect in the 'description'. Do not be generic.
            
            Return ONLY valid JSON.
            `
        }
      ],
      temperature: 0.5,
      max_tokens: 15000
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

// POST /api/role/workflow-custom - Generate a CUSTOM workflow based on user tools
router.post('/workflow-custom', async (req, res) => {
  const { role, customTools } = req.body;

  if (!role || !customTools) {
    return res.status(400).json({ error: 'Role and custom tools are required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    console.log(`Generating Custom Workflow for: ${role} with tools: ${customTools}`);
    
    // We only need the workflow part, so prompt specifically for that
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
            content: `You are an expert technical career coach. You need to REWRITE a professional workflow for a "${role}" but specifically using the user's preferred tools/stack.`
          },
          {
            role: 'user',
            content: `
            Role: ${role}
            User's Preferred Tools/Stack: ${customTools}

            Task: Generate a detailed, step-by-step professional workflow/lifecycle for this role that strictly incorporates the user's preferred tools. 
            - If they said "Azure" instead of "AWS", use Azure services (e.g. Azure DevOps, AKS).
            - If they said "Java", use Java tools (e.g. Maven, Spring Boot).
            - Maintain a complete end-to-end lifecycle (Planning -> Dev -> Testing -> Deployment).
            - Provide 4-6 detailed stages.

            Return the response in this JSON format:
            {
               "workflow": [
                  {
                    "stage": "Stage Name",
                    "description": "Description of this stage",
                    "tools_used": ["Tool A", "Tool B"],
                    "activities": ["Activity 1", "Activity 2"]
                  }
               ],
               "role": "${role} with ${customTools}"
            }
            Return ONLY valid JSON.
            `
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON
    let workflowData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      workflowData = JSON.parse(jsonText);
    } catch (e) {
       // Fallback parse
       const startIndex = content.indexOf('{');
       const endIndex = content.lastIndexOf('}');
       if (startIndex !== -1 && endIndex !== -1) {
          workflowData = JSON.parse(content.substring(startIndex, endIndex + 1));
       }
    }

    if (!workflowData || !workflowData.workflow) {
        throw new Error("Failed to generate workflow structure");
    }

    res.json({
      success: true,
      data: workflowData
    });

  } catch (error) {
    console.error('Custom workflow error:', error);
    res.status(500).json({ error: 'Failed to generate custom workflow' });
  }
});





// POST /api/role/workflow-step-details - Generate detailed implementation guide for a step
router.post('/workflow-step-details', async (req, res) => {
  const { role, stage, tools } = req.body;

  if (!role || !stage) {
    return res.status(400).json({ error: 'Role and stage are required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    console.log(`Generating Step Details for: ${role} - ${stage}`);
    
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
            content: `You are a senior developer mentor. Provide technical implementation details for a specific workflow stage.`
          },
          {
            role: 'user',
            content: `
            Role: ${role}
            Stage: ${stage}
            Tools Used: ${tools ? tools.join(', ') : 'Standard tools'}

            Task: Provide a technical deep-dive for this specific stage.
            1. **Code Snippet**: A relevant code example (e.g., config file, API route, SQL query). 
            2. **Best Practices**: 3-4 bullet points of critical do's/don'ts.
            3. **Checklist**: 3-4 items to verify before moving to the next stage.

            Return the response in this JSON format:
            {
               "code_snippet": {
                  "language": "javascript/python/sql/yaml",
                  "code": "..."
               },
               "best_practices": ["Practice 1", "Practice 2"],
               "checklist": ["Item 1", "Item 2"]
            }
            Return ONLY valid JSON.
            `
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON
    let stepData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      stepData = JSON.parse(jsonText);
    } catch (e) {
       stepData = null;
    }

    if (!stepData) {
        throw new Error("Failed to generate step details");
    }

    res.json({
      success: true,
      data: stepData
    });

  } catch (error) {
    console.error('Step details error:', error);
    res.status(500).json({ error: 'Failed to generate step details' });
  }
});

// POST /api/role/save-workflow - Save a custom workflow
router.post('/save-workflow', async (req, res) => {
    const { userId, role, workflow } = req.body;
    // Implementation for DB save would go here
    // For now, we'll just mock success
    res.json({ success: true, message: "Workflow saved successfully" });
});


// GET /api/role/progress - Get completed topics for a role
router.get('/progress', async (req, res) => {
    const { role, userId } = req.query;

    if (!userId || !role) {
        return res.status(400).json({ error: 'User ID and Role are required' });
    }

    try {
        const result = await pool.query(
            "SELECT topic_name FROM roadmap_progress WHERE user_id = $1 AND role = $2",
            [userId, role]
        );
        
        const completedTopics = result.rows.map(row => row.topic_name);
        res.json({ success: true, completedTopics });
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// POST /api/role/progress - Toggle topic completion
router.post('/progress', async (req, res) => {
    const { role, userId, topicName, isCompleted } = req.body;

    if (!userId || !role || !topicName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        if (isCompleted) {
            // Add to progress
            await pool.query(
                "INSERT INTO roadmap_progress (user_id, role, topic_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
                [userId, role, topicName]
            );
        } else {
            // Remove from progress
            await pool.query(
                "DELETE FROM roadmap_progress WHERE user_id = $1 AND role = $2 AND topic_name = $3",
                [userId, role, topicName]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

module.exports = router;
