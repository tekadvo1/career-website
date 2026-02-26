const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const realtimeRoutes = require('./realtimeRoutes');

// POST /api/role/analyze - Generate detailed role analysis using AI
router.post('/analyze', async (req, res) => {
  const { role, userId, experienceLevel = 'Beginner', country = 'USA', learningPath } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const normalizedRole = `${role.trim().toLowerCase()} (${experienceLevel.toLowerCase()} - ${country.toLowerCase()}${learningPath ? ' - ' + learningPath : ''})`;
    
    // 1. Check for existing analysis (GLOBAL CACHE)
    // We strictly match the normalized role title which includes generic role + level + country
    const cacheResult = await pool.query(
      "SELECT analysis_data FROM role_analyses WHERE LOWER(role_title) = $1 ORDER BY created_at DESC LIMIT 1",
      [normalizedRole]
    );

    if (cacheResult.rows.length > 0) {
      const cachedData = cacheResult.rows[0].analysis_data;
      
      let isModernStructure = false;
      if (cachedData.roadmap && Array.isArray(cachedData.roadmap) && cachedData.roadmap.length > 0) {
          const firstPhase = cachedData.roadmap[0];
          if (firstPhase.topics && Array.isArray(firstPhase.topics) && firstPhase.topics.length > 0) {
              if (typeof firstPhase.topics[0] === 'object') {
                  isModernStructure = true;
              }
          }
      }

      if (isModernStructure) {
        console.log(`Returning GLOBAL cached analysis for: ${normalizedRole}`);
        return res.json({
          success: true,
          data: cachedData,
          source: 'cache_global'
        });
      }
      console.log(`Cache found but using old structure, regenerating for: ${normalizedRole}`);
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
            
            ${learningPath === 'master' ? 'CRITICAL: The user has chosen the "Develop & Master Current Skills" path. Focus heavily on advanced techniques, best practices, real-world deep problem solving, and becoming an expert in their current technical stack. The workflow, day in life, and skills should reflect a senior/expert deepening their craft.' : ''}
            ${learningPath === 'expand' ? 'CRITICAL: The user has chosen the "Add New Skills & Expand" path. Focus on identifying missing, highly-demanded complementary skills that expand their versatility. The workflow, day in life, and skills should reflect transitioning to a broader role or adopting new trending tools.' : ''}

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
        // Mark onboarding complete
        await pool.query("UPDATE users SET onboarding_completed = TRUE WHERE id = $1", [userId]);
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

// POST /api/role/projects - Generate detailed projects for a role
router.post('/projects', async (req, res) => {
  const { role, resumeData, type } = req.body; // type can be 'trending'
  const projectType = type || 'standard';

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    // 1. Check Cache
    const cacheResult = await pool.query(
        "SELECT projects_data FROM cached_recommendations WHERE role = $1 AND type = $2",
        [role, projectType]
    );

    if (cacheResult.rows.length > 0) {
        console.log(`Using cached projects for ${role} (${projectType})`);
        return res.json({
            success: true,
            data: cacheResult.rows[0].projects_data,
            source: 'cache'
        });
    }

    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    console.log(`Generating Projects for: ${role} [Type: ${projectType}]`);
    
    const resumeContext = resumeData 
       ? `The user has the following background coming from their resume: ${resumeData.substring(0, 500)}...`
       : "The user is starting fresh or has not provided a specific resume.";

    let systemPrompt = `You are a technical mentor designing portfolio projects.`;
    let userTask = `Task: Suggest 15 comprehensive, outcome-driven portfolio projects that would help someone get hired for this role.
            - YOU MUST PROVIDE EXACTLY: 
                - 5 Beginner Projects
                - 5 Intermediate Projects
                - 5 Advanced Projects
            - Ensure at least 3-4 projects are marked as "trending" (using modern tech stacks).
            - FOCUS ON CAREER OUTCOMES. NOT just "learning".`;

    if (projectType === 'trending') {
        systemPrompt = `You are a Tech Trend Forecaster and Senior Architect. 
        ACT AS IF YOU ARE PROCESSING REAL-TIME WEB SEARCH DATA for late 2024/2025 technology trends.
        Identify the single most VIRAL or HIGH-DEMAND project type currently spiking in recruiter interest for this role.`;
        
        userTask = `
            Task: Generate ONE (1) bleeding-edge, "Trending" portfolio project that uses the absolute latest stack (e.g., Next.js 14/15, AI Agents, Vector DBs, Rust, etc. relevant to the role).
            
            This project must look and feel like it was ripped from the "Top Trending" on GitHub or Product Hunt this week.
            
            CRITICAL:
            - Use a modern naming convention (e.g. "AI-Powered Financial Analyst Agent", "Distributed Edge Compute Network").
            - The "whyRecommended" section must reference "Current Market spikes in demand for [Tech]".
            - The "recruiterAppeal" must mention "2025-ready skills".
            
            Return the response in the standard JSON format with a single project in the 'projects' array.
        `;
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: `
            Role: ${role}
            Context: ${resumeContext}
            ${userTask}
            
            Return the response in this JSON format:
            {
               "projects": [
                  {
                    "id": "1",
                    "title": "Project Title",
                    "description": "2-sentence purpose-driven description.",
                    "difficulty": "Beginner/Intermediate/Advanced",
                    "duration": "e.g. 2 weeks",
                    "matchScore": 85 (integer 0-100 based on relevance to role),
                    "tags": ["Tag1", "Tag2"],
                    "trending": true,
                    "status": "active",
                    
                    "whyRecommended": [
                        "Closes specific skill gap [Skill Name]",
                        "Required in senior [Role] interviews",
                        "Builds on your existing [Skill] foundation"
                    ],

                    "careerImpact": [
                        "Increases Senior [Role] match from 78% -> 92%",
                        "Strengthens [Specific Architecture] skills",
                        "Improves [Specific Domain] readiness"
                    ],

                    "metrics": {
                        "matchIncrease": "+14%",
                        "xp": 500,
                        "timeEstimate": "15 Hours",
                        "roleRelevance": "Used in 68% of Senior roles"
                    },

                    "skillGainEstimates": [
                        { "skill": "Skill A", "before": 45, "after": 80 },
                        { "skill": "Skill B", "before": 30, "after": 75 },
                        { "skill": "Skill C", "before": 60, "after": 90 }
                    ],

                    "curriculumStats": {
                        "modules": 5,
                        "tasks": 12,
                        "deployment": true,
                        "codeReview": true
                    },

                    "recruiterAppeal": [
                        "Real-time backend architecture",
                        "Production-ready Docker setup",
                        "Scalable database implementation"
                    ],

                    "skillsToDevelop": ["Skill 1", "Skill 2"],
                    "tools": ["Tool 1", "Tool 2"],
                    "languages": ["Lang 1"],
                    "setupGuide": {
                       "title": "Quick Start",
                       "steps": ["git clone...", "npm install..."]
                    }
                  }
               ]
            }
            Return ONLY valid JSON.
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 15000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON logic identical to above
    let projectData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      projectData = JSON.parse(jsonText);
    } catch (e) {
       const startIndex = content.indexOf('{');
       const endIndex = content.lastIndexOf('}');
       if (startIndex !== -1 && endIndex !== -1) {
          projectData = JSON.parse(content.substring(startIndex, endIndex + 1));
       }
    }

    if (!projectData || !projectData.projects) {
        throw new Error("Failed to generate project structure");
    }

    // Cache Results
    try {
        await pool.query(
            `INSERT INTO cached_recommendations (role, type, projects_data)
             VALUES ($1, $2, $3)
             ON CONFLICT (role, type) DO UPDATE SET projects_data = $3`,
            [role, projectType, JSON.stringify(projectData.projects)]
        );
    } catch (cacheError) {
        console.error("Failed to cache projects", cacheError);
    }

    res.json({
      success: true,
      data: projectData.projects
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({ error: 'Failed to generate projects' });
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

// POST /api/role/project-details - Generate DETAILED curriculum for a specific project
router.post('/project-details', async (req, res) => {
    const { projectTitle, role, difficultly, techStack, timeCommitment } = req.body;

    if (!projectTitle || !role) {
        return res.status(400).json({ error: 'Project Title and Role are required' });
    }

    try {
        // 1. Check Cache
        const cacheResult = await pool.query(
            "SELECT curriculum_data FROM cached_curriculums WHERE project_title = $1 AND role = $2",
            [projectTitle, role]
        );

        if (cacheResult.rows.length > 0) {
            console.log(`Using cached curriculum for ${projectTitle}`);
            return res.json({
                success: true,
                data: cacheResult.rows[0].curriculum_data,
                source: 'cache'
            });
        }

        const fetch = (await import('node-fetch')).default;
        const apiKey = process.env.OPENAI_API_KEY;

        console.log(`Generating Project Curriculum for: ${projectTitle} (${role})`);

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
                        content: `You are a Senior Technical Lead creating a project implementation guide.`
                    },
                    {
                        role: 'user',
                        content: `
                        Project: ${projectTitle}
                        Role Target: ${role}
                        Difficulty: ${difficultly || 'Intermediate'}
                        Tech Stack: ${techStack ? techStack.join(', ') : 'Standard Industry Stack'}
                        Weekly Time Commitment: ${timeCommitment || 'Flexible'} hours

                        Task: Create a complete, step-by-step implementation curriculum for this project, tailored to the user's time commitment.
                        - Break it down into 4-6 Logical MODULES.
                        - Each module should have 2-4 TASKS.
                        - Each module MUST have an "estimatedHours" field based on the difficulty and user's pace.
                        - For each task, provide:
                            - Title
                            - Description (What strictly needs to be done)
                            - "Why" (Context)
                            - Code Snippet (or Command) relative to the task.
                            - Verification Step (How to check if it works)
                            - Estimated Duration (e.g. "45 mins")

                        Return the response in this JSON format:
                        {
                            "curriculum": [
                                {
                                    "id": "module-1",
                                    "title": "Module 1: Setup & Init",
                                    "estimatedHours": "2 hours",
                                    "tasks": [
                                        {
                                            "id": "task-1-1",
                                            "title": "Initialize Repository",
                                            "description": "Set up git and initial folder structure.",
                                            "why": "Standard practice for version control.",
                                            "codeSnippet": "git init\nnpm init -y",
                                            "verification": "Run 'git status' to see initialized repo.",
                                            "duration": "15 mins"
                                        }
                                    ]
                                }
                            ]
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
        let curriculumData;
        try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
            const jsonText = jsonMatch ? jsonMatch[1] : content;
            curriculumData = JSON.parse(jsonText);
        } catch (e) {
            const startIndex = content.indexOf('{');
            const endIndex = content.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1) {
                curriculumData = JSON.parse(content.substring(startIndex, endIndex + 1));
            }
        }

        if (!curriculumData || !curriculumData.curriculum) {
            throw new Error("Failed to generate curriculum structure");
        }

        // Cache Results
        try {
            await pool.query(
                `INSERT INTO cached_curriculums (project_title, role, curriculum_data)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (project_title, role) DO UPDATE SET curriculum_data = $3`,
                [projectTitle, role, JSON.stringify(curriculumData.curriculum)]
            );
        } catch (cacheError) {
            console.error("Failed to cache curriculum", cacheError);
        }

        res.json({
            success: true,
            data: curriculumData.curriculum
        });

    } catch (error) {
        console.error('Project curriculum generation error:', error);
        res.status(500).json({ error: 'Failed to generate curriculum' });
    }
});

// POST /api/role/adaptive-schedule - Recalculate timeline based on missed days
router.post('/adaptive-schedule', async (req, res) => {
    try {
        const { currentCompletionDate, lastActiveDate, weeklyHours, tasksRemaining } = req.body;
        
        // Simple Simulation Logic for "Adaptive AI"
        // In reality, this would check DB for missed daily goals
        const today = new Date();
        const lastActive = lastActiveDate ? new Date(lastActiveDate) : new Date();
        
        // Calculate days inactive
        const diffTime = Math.abs(today - lastActive);
        const daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        let adjustmentMessage = null;
        let newCompletionDate = currentCompletionDate; 
        let daysDelayed = 0;

        // If inactive for more than 2 days, trigger adaptive scheduling
        if (daysInactive > 2) {
            daysDelayed = daysInactive;
            
            // Push completion date
            const currentEnd = new Date(currentCompletionDate);
            currentEnd.setDate(currentEnd.getDate() + daysDelayed);
            newCompletionDate = currentEnd.toISOString();

            adjustmentMessage = `Visualizing schedule... You missed ${daysInactive} days. We've adjusted your timeline by +${daysDelayed} days to keep you on track without burnout.`;
        }

        res.json({
            success: true,
            adjustmentNeeded: daysInactive > 2,
            adjustmentMessage,
            daysDelayed,
            newCompletionDate,
            daysInactive
        });

    } catch (error) {
        console.error('Adaptive Schedule Error:', error);
        res.status(500).json({ error: 'Failed to recalculate schedule' });
    }
});


// POST /api/role/start-project - Saves a project to user_projects
router.post('/start-project', async (req, res) => {
    const { userId, project, role, curriculum } = req.body;

    if (!userId || !project) {
        return res.status(400).json({ error: 'User ID and Project are required' });
    }

    try {
        // Check if project already started
        const existing = await pool.query(
            "SELECT id FROM user_projects WHERE user_id = $1 AND title = $2",
            [userId, project.title]
        );

        if (existing.rows.length > 0) {
            return res.json({ success: true, projectId: existing.rows[0].id, message: 'Project already started' });
        }

        const result = await pool.query(
            `INSERT INTO user_projects (user_id, title, description, role, status, project_data, progress_data)
             VALUES ($1, $2, $3, $4, 'active', $5, $6)
             RETURNING id`,
            [
                userId, 
                project.title, 
                project.description,
                role,
                JSON.stringify({ ...project, curriculum }), // Store full project + curriculum
                JSON.stringify({ completedTasks: [], xp: 0, currentModule: 0, currentTask: 0 })
            ]
        );

        res.json({ success: true, projectId: result.rows[0].id });

        // ── Real-time broadcast ──────────────────────────────────────────────
        try { realtimeRoutes.broadcast(String(userId), 'project_update', { projectId: result.rows[0].id, action: 'started' }); } catch (_) {}
    } catch (err) {
        console.error('Error starting project:', err);
        res.status(500).json({ error: 'Failed to start project' });
    }
});

// POST /api/role/update-project-progress - Updates progress_data
router.post('/update-project-progress', async (req, res) => {
    const { userId, projectId, progress } = req.body;

    if (!userId || !projectId || !progress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await pool.query(
            `UPDATE user_projects 
             SET progress_data = $1, last_updated = NOW()
             WHERE id = $2 AND user_id = $3`,
            [JSON.stringify(progress), projectId, userId]
        );
        res.json({ success: true });

        // ── Real-time broadcast ──────────────────────────────────────────────
        try { realtimeRoutes.broadcast(String(userId), 'project_update', { projectId, action: 'progress_updated' }); } catch (_) {}
    } catch (err) {
        console.error('Error updating project progress:', err);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// GET /api/role/my-projects - Get active projects for a user
router.get('/my-projects', async (req, res) => {
    const { userId, role } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        let query = "SELECT * FROM user_projects WHERE user_id = $1";
        const params = [userId];

        if (role) {
            query += " AND role = $2";
            params.push(role);
        }

        query += " ORDER BY last_updated DESC";

        const result = await pool.query(query, params);
        res.json({ success: true, projects: result.rows });
    } catch (err) {
        console.error('Error fetching user projects:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

module.exports = router;
