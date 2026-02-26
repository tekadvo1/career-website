const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');
let pdfParse = require('pdf-parse');

const pool = require('../config/db');

// Debug PDF Parse Import
console.log('PDF Parse Import Type:', typeof pdfParse);
if (typeof pdfParse === 'object') {
  console.log('PDF Parse Keys:', Object.keys(pdfParse));
  // Attempt to use default if function is missing
  if (typeof pdfParse.default === 'function') {
    pdfParse = pdfParse.default;
  }
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX allowed.'));
    }
  }
});

// POST /api/resume/analyze - Analyze uploaded resume with OpenAI
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { userId } = req.body;
    if (userId) {
       try {
         await pool.query("UPDATE users SET onboarding_completed = TRUE WHERE id = $1", [userId]);
       } catch (e) {
         console.error("Failed to update onboarding status", e);
       }
    }

    let resumeText = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      try {
        if (typeof pdfParse !== 'function') {
            throw new Error(`PDF Parse library is not a function (Type: ${typeof pdfParse})`);
        }
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (err) {
        console.error('Error parsing PDF:', err);
        return res.status(400).json({ error: 'Failed to parse PDF file. ' + err.message });
      }
    } else if (
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      req.file.mimetype === 'application/msword'
    ) {
      // Extract text from DOCX
      try {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = result.value;
      } catch (err) {
         console.error('Error parsing DOCX:', err);
         return res.status(400).json({ error: 'Failed to parse DOCX file' });
      }
    } else {
       return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Call OpenAI API to analyze the resume
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
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
            content: 'You are an expert career advisor and resume analyzer. Analyze resumes and provide detailed insights about skills, experience, and recommended career paths.'
          },
          {
            role: 'user',
            content: `Analyze this resume and provide a highly detailed career path JSON response.
            
            Identify the user's current level and suggest the best next role.
            Analyze gaps between their current skills and the market trends for that role.
            
            Return ONLY valid JSON with this structure:
            {
              "suggestedRole": "Best fit job title",
              "experienceLevel": "Beginner/Intermediate/Advanced",
              "jobGrowth": "e.g. +22% demand",
              "salaryRange": "e.g. $90k - $140k",
              "description": "Professional summary and career trajectory advice based on valid resume data.",
              "summary": "A short, engaging paragraph summarizing their foundation and expertise (e.g. 'Your resume shows strong foundation in web development with expertise in...').",
              "technicalSkills": ["List of core technical skills extracted, e.g., JavaScript, React, Node.js"],
              "softSkills": ["List of core soft skills extracted, e.g., Communication, Problem Solving"],
              "missingSkills": [
                { "name": "Skill Name", "level": "Required Level", "priority": "High Priority", "timeToLearn": "e.g. 2 weeks", "reason": "Why this is needed for the role" }
              ],
              "existingSkills": [
                { "name": "Skill Name", "level": "Current Level", "priority": "Medium Priority", "timeToLearn": "Ongoing", "reason": "How to master/advance this skill" }
              ],
              "tools": [
                { "name": "Tool Name", "category": "DevOps/Design/etc", "difficulty": "Easy/Hard" }
              ],
              "languages": ["List all relevant languages"],
              "frameworks": ["List all relevant frameworks"],
              "resources": [
                { "name": "Specific Course/Resource Title", "provider": "Udemy/Coursera/Docs", "type": "Course/Video", "url": "URL or generic link" }
              ],
              "strengths": ["List all identified strengths"],
              "recommendations": ["List all relevant recommendations"]
            }
            
            Resume text:
            ${resumeText}
            
            CRITICAL: Do not restrict the number of items in any list (skills, tools, languages, resources). Provide a comprehensive, real-time, exhaustive analysis based on the resume and current job market standards.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(500).json({ error: 'Failed to analyze resume with AI' });
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (err) {
      console.error('Error parsing OpenAI response:', err);
      // Fallback
      analysis = {
        suggestedRole: 'Software Engineer',
        experienceLevel: 'Intermediate',
        description: 'Analysis failed to parse. Please try again.',
        skills: [],
        tools: [],
        resources: []
      };
    }

    res.json({
      success: true,
      analysis: analysis,
      resumeFileName: req.file.originalname
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
