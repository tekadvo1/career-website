const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const pool = require('../config/db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── GET /api/project-structure/:role ─────────────────────────────────────────────
// Returns cached project structure from DB if available, otherwise generates via AI
router.get('/:role', async (req, res) => {
  const role = decodeURIComponent(req.params.role);

  try {
    // 1. Check DB cache first
    const cached = await pool.query(
      'SELECT structure_data, updated_at FROM project_structures WHERE role = $1',
      [role]
    );

    if (cached.rows.length > 0) {
      console.log(`[Cache Hit] Project structure for role: "${role}"`);
      return res.json({
        success: true,
        role,
        structure: cached.rows[0].structure_data,
        cached: true,
        updatedAt: cached.rows[0].updated_at,
      });
    }

    console.log(`[Cache Miss] Generating project structure for role: "${role}"`);

    // 2. Generate via AI
    const systemPrompt = `You are an expert Senior Software Architect and Engineering Mentor.

A developer with the role "${role}" wants to understand how to structure their first professional project from scratch.

Generate a COMPLETE, detailed, professional project structure guide for a "${role}". 
Be highly educational — explain WHY each folder and file exists, not just WHAT it is.
The developer should be able to read this and immediately understand how to start building.

You MUST return a valid JSON object with this exact schema:
{
  "projectName": "Descriptive project name for this role (e.g. 'React + TypeScript SPA')",
  "projectDescription": "One sentence describing the type of project",
  "techStack": ["Tech1", "Tech2", "Tech3", "Tech4"],
  "folders": [
    {
      "path": "src/",
      "description": "Short label",
      "explanation": "Detailed explanation of WHY this folder exists and what belongs in it"
    }
  ],
  "files": [
    {
      "name": "src/main.tsx",
      "description": "Short label",
      "purpose": "What this file does in the project",
      "explanation": "Deep explanation of why this file is needed, what it contains, and how it connects to the rest"
    }
  ],
  "security": [
    {
      "title": "Security measure title",
      "description": "What it protects against",
      "implementation": "Exactly how to implement it in this project",
      "importance": "Why this specific security measure matters for this role"
    }
  ],
  "architecture": [
    {
      "layer": "Layer/Component name",
      "description": "Brief description",
      "details": "Detailed explanation of this architectural layer, how it connects to others, and best practices"
    }
  ],
  "database": [
    {
      "name": "Database or storage solution",
      "description": "Brief description",
      "config": "Setup and configuration guidance",
      "explanation": "Why this database choice is right for this role and project type"
    }
  ],
  "devops": [
    {
      "tool": "Tool name",
      "description": "Brief description",
      "setup": "How to set it up for this project",
      "explanation": "Why this DevOps tool is critical for this role"
    }
  ],
  "gettingStarted": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ]
}

Make it educational, detailed, and role-specific. Include at least:
- 8-12 folders
- 8-12 key files  
- 6-8 security measures
- 5-8 architecture layers
- 4-6 database/storage items
- 5-8 DevOps tools
- 5-7 getting started steps`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 3500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // 3. Save to DB cache
    await pool.query(
      `INSERT INTO project_structures (role, structure_data)
       VALUES ($1, $2)
       ON CONFLICT (role) DO UPDATE SET structure_data = EXCLUDED.structure_data, updated_at = CURRENT_TIMESTAMP`,
      [role, JSON.stringify(parsed)]
    );

    return res.json({ success: true, role, structure: parsed, cached: false });
  } catch (err) {
    console.error('Project structure generation error:', err);
    res.status(500).json({ error: 'Failed to generate project structure' });
  }
});

// ── POST /api/project-structure/custom ───────────────────────────────────────────
// Generate a custom project structure based on user description (not cached per-role uniquely)
router.post('/custom', async (req, res) => {
  const { role, customDescription } = req.body;

  if (!role || !customDescription) {
    return res.status(400).json({ error: 'role and customDescription are required' });
  }

  try {
    const systemPrompt = `You are an expert Senior Software Architect and Engineering Mentor.

A "${role}" developer wants to build a custom project described as:
"${customDescription}"

Generate a COMPLETE, detailed, professional project structure guide tailored to their specific project.
Be highly educational — explain WHY each folder and file exists, not just WHAT it is.

You MUST return a valid JSON object with this exact schema:
{
  "projectName": "Descriptive name based on their description",
  "projectDescription": "One sentence describing their specific project",
  "techStack": ["Tech1", "Tech2", "Tech3"],
  "folders": [
    {
      "path": "src/",
      "description": "Short label",
      "explanation": "Detailed explanation of WHY this folder exists for their specific project"
    }
  ],
  "files": [
    {
      "name": "filename",
      "description": "Short label",
      "purpose": "What this file does",
      "explanation": "Deep explanation tailored to their project"
    }
  ],
  "security": [
    {
      "title": "Security measure",
      "description": "What it protects against",
      "implementation": "How to implement it",
      "importance": "Why it matters for their project"
    }
  ],
  "architecture": [
    {
      "layer": "Layer name",
      "description": "Brief description",
      "details": "Detailed explanation for their project"
    }
  ],
  "database": [
    {
      "name": "Database solution",
      "description": "Brief description",
      "config": "Configuration guidance",
      "explanation": "Why this is right for their project"
    }
  ],
  "devops": [
    {
      "tool": "Tool name",
      "description": "Brief description",
      "setup": "How to set it up",
      "explanation": "Why this tool is needed"
    }
  ],
  "gettingStarted": ["Step 1: ...", "Step 2: ..."]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `My project: ${customDescription}` },
      ],
      max_tokens: 3500,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // Cache the custom result for user
    const userId = req.user?.id;
    if (userId) {
      await pool.query(
        `INSERT INTO project_structures_custom (user_id, role, description, structure_data)
         VALUES ($1, $2, $3, $4)`,
        [userId, role, customDescription, JSON.stringify(parsed)]
      );
    }

    return res.json({ success: true, role, structure: parsed, cached: false });
  } catch (err) {
    console.error('Custom project structure error:', err);
    res.status(500).json({ error: 'Failed to generate custom project structure' });
  }
});

module.exports = router;
