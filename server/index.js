const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const resumeParser = require('./resumeParser');
const conversationHandler = require('./conversationHandler');
const agoraService = require('./agoraService');
const fitScoring = require('./fitScoring');
const skillMatrix = require('./skillMatrix');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory storage for parsed resumes and job description
const resumeDatabase = [];
let currentJobDescription = null;

// Upload resume endpoint
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const parsedData = await resumeParser.parseResume(filePath);
    
    const resume = {
      id: Date.now().toString(),
      filename: req.file.originalname,
      ...parsedData,
      uploadedAt: new Date()
    };
    
    resumeDatabase.push(resume);
    
    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      resumeId: resume.id,
      candidateName: resume.name
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await conversationHandler.handleQuery(message, resumeDatabase, currentJobDescription);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Job description endpoint
app.post('/api/job-description', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    currentJobDescription = jobDescription;
    
    // Evaluate all candidates against JD
    const evaluatedCandidates = await fitScoring.evaluateAllCandidates(jobDescription, resumeDatabase);
    
    res.json({ 
      success: true, 
      message: 'Job description saved and candidates evaluated',
      topCandidates: evaluatedCandidates.slice(0, 5).map(c => ({
        name: c.name,
        fitScore: c.fitScore,
        explanation: c.fitExplanation,
        strengths: c.strengths,
        gaps: c.gaps
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Skill matrix endpoint
app.get('/api/skill-matrix', (req, res) => {
  try {
    const matrix = skillMatrix.generateSkillMatrix(resumeDatabase);
    res.json({ success: true, ...matrix });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  try {
    const stats = skillMatrix.getSkillStatistics(resumeDatabase);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agora token endpoint
app.post('/api/agora/token', (req, res) => {
  try {
    const { channelName, uid } = req.body;
    const token = agoraService.generateToken(channelName, uid);
    res.json({ success: true, token, appId: process.env.AGORA_APP_ID });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all resumes
app.get('/api/resumes', (req, res) => {
  res.json({ 
    success: true, 
    resumes: resumeDatabase.map(r => ({
      id: r.id,
      name: r.name,
      filename: r.filename,
      skills: r.skills,
      yearsOfExperience: r.yearsOfExperience,
      education: r.education
    }))
  });
});

// Create uploads directory
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
