const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const pool = require('../config/db');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── POST /api/project-structure/generate ─────────────────────────────────────
// Free-form prompt → full project structure (cached by normalized prompt key)
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const promptKey = prompt.trim().toLowerCase().replace(/\s+/g, ' ');

  try {
    // 1. Check DB cache first
    const cached = await pool.query(
      'SELECT structure_data, updated_at FROM project_structures WHERE role = $1',
      [promptKey]
    );

    if (cached.rows.length > 0) {
      console.log(`[Cache Hit] "${promptKey}"`);
      return res.json({
        success: true,
        structure: cached.rows[0].structure_data,
        cached: true,
        updatedAt: cached.rows[0].updated_at,
      });
    }

    console.log(`[Cache Miss] Generating for prompt: "${promptKey}"`);

    // 2. Generate via AI
    const systemPrompt = `You are an expert Senior Software Architect and Engineering Mentor.

A developer wants to build a project described as: "${prompt}"

Generate a COMPLETE, detailed, professional project structure guide for this project.
Be highly educational — explain WHY each folder and file exists, not just WHAT it is.
Tailor everything specifically to the type of project they described.

You MUST return a valid JSON object with this exact schema:
{
  "projectName": "Descriptive project name based on their prompt",
  "projectDescription": "One sentence describing this specific project",
  "techStack": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  "folders": [
    {
      "path": "src/",
      "description": "Short label",
      "explanation": "Detailed explanation of WHY this folder exists and what belongs in it for this specific project"
    }
  ],
  "files": [
    {
      "name": "src/main.ts",
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
      "importance": "Why this specific security measure matters for this type of project"
    }
  ],
  "architecture": [
    {
      "layer": "Layer/Component name",
      "description": "Brief description",
      "details": "Detailed explanation of this architectural layer, how it connects to others, and best practices for this project type"
    }
  ],
  "database": [
    {
      "name": "Database or storage solution",
      "description": "Brief description",
      "config": "Setup and configuration guidance",
      "explanation": "Why this database choice is right for this specific project"
    }
  ],
  "devops": [
    {
      "tool": "Tool name",
      "description": "Brief description",
      "setup": "How to set it up for this project",
      "explanation": "Why this DevOps tool is critical for this type of project"
    }
  ],
  "gettingStarted": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ]
}

Make it educational, detailed, and highly specific to their project. Include at least:
- 8-12 folders
- 8-12 key files
- 6-8 security measures (especially relevant to this domain)
- 5-8 architecture layers
- 3-5 database/storage solutions
- 5-7 DevOps tools
- 5-8 getting started steps`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate project structure for: ${prompt}` },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // 3. Cache it
    await pool.query(
      `INSERT INTO project_structures (role, structure_data)
       VALUES ($1, $2)
       ON CONFLICT (role) DO UPDATE SET structure_data = EXCLUDED.structure_data, updated_at = CURRENT_TIMESTAMP`,
      [promptKey, JSON.stringify(parsed)]
    );

    return res.json({ success: true, structure: parsed, cached: false });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate project structure' });
  }
});

// ── POST /api/project-structure/chat ─────────────────────────────────────────
// AI Assistant chat with real-time context of the currently generated structure
router.post('/chat', async (req, res) => {
  const { message, structure, history = [], projectPrompt = '' } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const structureContext = structure
      ? `The user has generated a project structure for: "${projectPrompt}"

Here is the full project structure they are viewing:
Project Name: ${structure.projectName}
Description: ${structure.projectDescription}
Tech Stack: ${structure.techStack?.join(', ')}

Folders:
${structure.folders?.map(f => `- ${f.path}: ${f.description}`).join('\n')}

Files:
${structure.files?.map(f => `- ${f.name}: ${f.purpose}`).join('\n')}

Security measures: ${structure.security?.map(s => s.title).join(', ')}
Architecture layers: ${structure.architecture?.map(a => a.layer).join(', ')}
Databases: ${structure.database?.map(d => d.name).join(', ')}
DevOps tools: ${structure.devops?.map(d => d.tool).join(', ')}

Answer questions specifically about this project structure.`
      : 'No project structure has been generated yet. Help the user understand what they can generate.';

    const systemContent = `You are an expert AI Software Architecture Assistant embedded in a project structure generator tool.

${structureContext}

Your role:
- Answer questions about the specific project structure shown
- Explain why certain folders/files/tools were chosen
- Give deeper implementation guidance
- Suggest improvements or alternatives
- Be concise but detailed — use markdown formatting (bold, code blocks, bullet points)
- Keep responses under 300 words unless the user asks for more detail`;

    const contextMessages = history.slice(-8).map(h => ({
      role: h.role,
      content: h.content,
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemContent },
        ...contextMessages,
        { role: 'user', content: message },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return res.json({
      success: true,
      reply: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// ── Keep legacy GET route for backward compat ─────────────────────────────────
router.get('/:role', async (req, res) => {
  const role = decodeURIComponent(req.params.role);
  try {
    const cached = await pool.query(
      'SELECT structure_data, updated_at FROM project_structures WHERE role = $1',
      [role]
    );
    if (cached.rows.length > 0) {
      return res.json({ success: true, role, structure: cached.rows[0].structure_data, cached: true });
    }
    return res.status(404).json({ error: 'Not cached. Use POST /generate instead.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch structure' });
  }
});

module.exports = router;
