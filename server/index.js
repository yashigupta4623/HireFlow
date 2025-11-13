const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
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

// Upload resume from URL endpoint
app.post('/api/upload-link', async (req, res) => {
  try {
    const { link } = req.body;
    
    if (!link) {
      return res.status(400).json({ success: false, error: 'Link is required' });
    }

    console.log('Downloading resume from:', link);

    // Download file from URL with timeout and headers
    const response = await axios.get(link, { 
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Determine file extension from URL or content-type
    let extension = '.pdf';
    const urlExt = link.split('.').pop().toLowerCase();
    if (['pdf', 'docx', 'txt', 'doc'].includes(urlExt)) {
      extension = '.' + urlExt;
    } else if (response.headers['content-type']) {
      const contentType = response.headers['content-type'];
      if (contentType.includes('pdf')) extension = '.pdf';
      else if (contentType.includes('word') || contentType.includes('docx')) extension = '.docx';
      else if (contentType.includes('text')) extension = '.txt';
    }
    
    // Save to temp file
    const tempFilename = `${Date.now()}-resume-from-link${extension}`;
    const tempPath = path.join('uploads', tempFilename);
    fs.writeFileSync(tempPath, response.data);
    
    console.log('File downloaded and saved to:', tempPath);
    
    // Parse the downloaded file
    const parsedData = await resumeParser.parseResume(tempPath);
    
    const resume = {
      id: Date.now().toString(),
      filename: tempFilename,
      sourceLink: link,
      ...parsedData,
      uploadedAt: new Date()
    };
    
    resumeDatabase.push(resume);
    
    console.log('Resume parsed successfully:', resume.name);
    
    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully from link',
      resumeId: resume.id,
      candidateName: resume.name
    });
  } catch (error) {
    console.error('Upload link error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: `Failed to upload from link: ${error.message}` 
    });
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

// Job description from link endpoint
app.post('/api/job-description-link', async (req, res) => {
  try {
    const { link } = req.body;
    
    if (!link) {
      return res.status(400).json({ success: false, error: 'Link is required' });
    }

    console.log('Fetching job description from:', link);

    // Fetch the job description from URL
    const response = await axios.get(link, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Extract text content (basic HTML parsing)
    let jobDescription = response.data;
    
    // If it's HTML, try to extract text content
    if (typeof jobDescription === 'string' && jobDescription.includes('<html')) {
      // Simple HTML tag removal
      jobDescription = jobDescription
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    currentJobDescription = jobDescription;
    
    // Evaluate all candidates against JD
    const evaluatedCandidates = await fitScoring.evaluateAllCandidates(jobDescription, resumeDatabase);
    
    console.log('Job description fetched and candidates evaluated');
    
    res.json({ 
      success: true, 
      message: 'Job description fetched and candidates evaluated',
      jobDescription: jobDescription,
      topCandidates: evaluatedCandidates.slice(0, 5).map(c => ({
        name: c.name,
        fitScore: c.fitScore,
        explanation: c.fitExplanation,
        strengths: c.strengths,
        gaps: c.gaps
      }))
    });
  } catch (error) {
    console.error('Job description link error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: `Failed to fetch job description: ${error.message}` 
    });
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

// Rank candidates endpoint
app.get('/api/rank-candidates', (req, res) => {
  try {
    const { sortBy } = req.query;
    
    let rankedCandidates = resumeDatabase.map(candidate => {
      // Extract internship count from experience or work history
      const internships = (candidate.experience || []).filter(exp => 
        exp.toLowerCase().includes('intern')
      ).length;
      
      const yearsOfExperience = candidate.yearsOfExperience || 0;
      
      // Calculate combined score (weighted)
      const combinedScore = (yearsOfExperience * 10) + (internships * 5);
      
      return {
        id: candidate.id,
        name: candidate.name,
        yearsOfExperience,
        internships,
        combinedScore,
        skills: candidate.skills,
        education: candidate.education
      };
    });
    
    // Sort based on criteria
    if (sortBy === 'experience') {
      rankedCandidates.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
    } else if (sortBy === 'internships') {
      rankedCandidates.sort((a, b) => b.internships - a.internships);
    } else if (sortBy === 'combined') {
      rankedCandidates.sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    res.json({ 
      success: true, 
      candidates: rankedCandidates 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
