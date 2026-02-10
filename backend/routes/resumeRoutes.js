const express = require('express');
const router = express.Router();
const multer = require('multer');
let pdfParse = require('pdf-parse');
// Handle potential ESM/CJS interop issues
if (typeof pdfParse !== 'function' && pdfParse.default) {
  pdfParse = pdfParse.default;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX allowed.'));
    }
  }
});

// POST /api/resume/analyze - Analyze uploaded resume with OpenAI
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let resumeText = '';

    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (err) {
        console.error('Error parsing PDF:', err);
        return res.status(400).json({ error: 'Failed to parse PDF file' });
      }
    } else {
      // For DOC/DOCX, we'll need a different parser (mammoth or textract)
      // For now, return an error
      return res.status(400).json({ error: 'Currently only PDF files are supported for analysis' });
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
            content: `Analyze this resume and provide a JSON response with the following structure:
{
  "suggestedRole": "The most suitable job role based on experience",
  "experienceLevel": "Beginner/Intermediate/Advanced",
  "skills": ["skill1", "skill2", "skill3", ...],
  "yearsOfExperience": number,
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "matchingProjects": ["project type 1", "project type 2", "project type 3"]
}

Resume text:
${resumeText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
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
      // If parsing fails, return a basic analysis
      analysis = {
        suggestedRole: 'Software Engineer',
        experienceLevel: 'Intermediate',
        skills: ['Problem Solving', 'Technical Skills', 'Communication'],
        yearsOfExperience: 0,
        strengths: ['Analyzed from resume'],
        recommendations: ['Continue building projects', 'Learn new technologies'],
        matchingProjects: ['Web Development', 'Mobile Apps', 'APIs']
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
