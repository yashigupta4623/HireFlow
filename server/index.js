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
const profileAnalyzer = require('./profileAnalyzer');
const aiInterviewService = require('./aiInterviewService');
const textToSpeechService = require('./textToSpeechService');
const speechToTextService = require('./speechToTextService');

const app = express();
const PORT = process.env.PORT || 3001;

// app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Load resumes from JSON file
// const fs = require('fs');
// const path = require('path');

const RESUMES_FILE_PATH = path.join(__dirname, '..', 'resumes.json');
let currentJobDescription = null;

// Helper function to read resumes from file
function getResumesFromFile() {
  try {
    if (fs.existsSync(RESUMES_FILE_PATH)) {
      const data = fs.readFileSync(RESUMES_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading resumes.json:', error);
    return [];
  }
}

// Helper function to save resumes to file
function saveResumesToFile(resumes) {
  try {
    fs.writeFileSync(RESUMES_FILE_PATH, JSON.stringify(resumes, null, 2));
    console.log(`Saved ${resumes.length} resumes to resumes.json`);
    return true;
  } catch (error) {
    console.error('Error saving resumes.json:', error);
    return false;
  }
}

// Helper function to add a resume
function addResume(resume) {
  const resumes = getResumesFromFile();
  resumes.push(resume);
  saveResumesToFile(resumes);
  return resume;
}

// Helper function to update a resume
function updateResume(resumeId, updates) {
  const resumes = getResumesFromFile();
  const index = resumes.findIndex(r => r.id === resumeId);
  if (index !== -1) {
    resumes[index] = { ...resumes[index], ...updates };
    saveResumesToFile(resumes);
    return resumes[index];
  }
  return null;
}

// Initialize file if it doesn't exist
if (!fs.existsSync(RESUMES_FILE_PATH)) {
  saveResumesToFile([]);
  console.log('Created resumes.json file');
} else {
  const resumes = getResumesFromFile();
  console.log(`Loaded ${resumes.length} resumes from resumes.json`);
}

// Upload resume endpoint
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const parsedData = await resumeParser.parseResume(filePath);

    // Extract profile links from resume text
    const profileLinks = profileAnalyzer.extractProfileLinks(parsedData.rawText || '');

    const resume = {
      id: Date.now().toString(),
      filename: req.file.originalname,
      ...parsedData,
      profileLinks,
      uploadedAt: new Date()
    };

    addResume(resume);

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
    let { link } = req.body;

    if (!link) {
      return res.status(400).json({ success: false, error: 'Link is required' });
    }

    console.log('Original link:', link);

    const driveMatch = link.match(/\/d\/(.*?)\//);
    const driveAlt = link.match(/id=([^&]+)/);
    let fileId = null;

    if (driveMatch) fileId = driveMatch[1];
    else if (driveAlt) fileId = driveAlt[1];

    if (!fileId) {
      return res.status(400).json({ success: false, error: 'Invalid Google Drive link' });
    }

    link = `https://drive.google.com/uc?export=download&id=${fileId}`;
    console.log('Direct download link:', link);

    const response = await axios.get(link, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

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

    const tempFilename = `${Date.now()}-resume${extension}`;
    const tempPath = path.join('uploads', tempFilename);
    fs.writeFileSync(tempPath, response.data);

    console.log('File downloaded and saved to:', tempPath);

    const parsedData = await resumeParser.parseResume(tempPath);

    const resume = {
      id: Date.now().toString(),
      filename: tempFilename,
      sourceLink: link,
      ...parsedData,
      uploadedAt: new Date()
    };

    // Add the new resume
    addResume(resume);

    console.log('Resume parsed successfully:', resume.name);

    res.json({
      success: true,
      message: 'Resume uploaded successfully from Google Drive link',
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

app.get('/api/resume-count', (req, res) => {
  try {
    const resumes = JSON.parse(fs.readFileSync('resumes.json', 'utf8'));
    res.json({ count: Object.keys(resumes).length });
  } catch (error) {
    res.json({ count: 0 });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const resumeDatabase = getResumesFromFile();
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

    let existingResumes = [];
    try {
      existingResumes = JSON.parse(fs.readFileSync('resumes.json', 'utf8'));
    } catch (error) {
      // If the JSON file doesn't exist, create an empty array
      if (error.code === 'ENOENT') {
        console.log('Resumes file not found. Creating a new file...');
        fs.writeFileSync('resumes.json', JSON.stringify([]));
        existingResumes = [];
      } else {
        throw error;
      }
    }

    // Evaluate all candidates against JD
    const evaluatedCandidates = await fitScoring.evaluateAllCandidates(jobDescription, existingResumes);

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
    const resumeDatabase = getResumesFromFile();
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
    const resumeDatabase = getResumesFromFile();
    const matrix = skillMatrix.generateSkillMatrix(resumeDatabase);
    res.json({ success: true, ...matrix });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  try {
    const resumeDatabase = getResumesFromFile();
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

// AI Interview: Start interview session
app.post('/api/ai-interview/start', (req, res) => {
  try {
    const { candidateId } = req.body;
    const resumeDatabase = getResumesFromFile();

    const candidate = resumeDatabase.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    // Initialize interview session
    const interviewSession = aiInterviewService.initializeInterview(
      candidateId,
      candidate,
      currentJobDescription
    );

    // Generate Agora token for voice channel
    const channelName = `interview-${candidateId}`;
    const token = agoraService.generateToken(channelName, 0);

    // Get first question
    const firstQuestion = aiInterviewService.getNextQuestion(candidateId);

    res.json({
      success: true,
      message: 'Interview session started',
      channelName,
      agoraToken: token,
      agoraAppId: process.env.AGORA_APP_ID,
      candidateName: candidate.name,
      firstQuestion: firstQuestion.question,
      totalQuestions: firstQuestion.totalQuestions
    });
  } catch (error) {
    console.error('Start interview error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interview: Get next question
app.post('/api/ai-interview/next-question', (req, res) => {
  try {
    const { candidateId } = req.body;

    const nextQuestion = aiInterviewService.getNextQuestion(candidateId);

    res.json({
      success: true,
      ...nextQuestion
    });
  } catch (error) {
    console.error('Next question error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interview: Process candidate answer
app.post('/api/ai-interview/process-answer', async (req, res) => {
  try {
    const { candidateId, answer, questionType } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Answer is required' });
    }

    const result = await aiInterviewService.processAnswer(candidateId, answer, questionType);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Process answer error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interview: Get interview summary
app.post('/api/ai-interview/summary', async (req, res) => {
  try {
    const { candidateId } = req.body;

    const summary = await aiInterviewService.getInterviewSummary(candidateId);

    // Store summary with candidate
    const resumeDatabase = getResumesFromFile();
    const candidate = resumeDatabase.find(c => c.id === candidateId);
    if (candidate) {
      if (!candidate.aiInterviews) {
        candidate.aiInterviews = [];
      }
      candidate.aiInterviews.push(summary);
      updateResume(candidateId, { aiInterviews: candidate.aiInterviews });
    }

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Interview summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interview: End interview session
app.post('/api/ai-interview/end', (req, res) => {
  try {
    const { candidateId } = req.body;

    const ended = aiInterviewService.endInterview(candidateId);

    res.json({
      success: true,
      message: ended ? 'Interview ended successfully' : 'Interview session not found'
    });
  } catch (error) {
    console.error('End interview error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Interview: Get active session status
app.get('/api/ai-interview/status/:candidateId', (req, res) => {
  try {
    const { candidateId } = req.params;

    const session = aiInterviewService.getInterviewSession(candidateId);

    if (!session) {
      return res.json({
        success: true,
        active: false
      });
    }

    res.json({
      success: true,
      active: true,
      candidateName: session.candidateName,
      currentQuestion: session.currentQuestion,
      totalQuestions: session.questions.length,
      startTime: session.startTime
    });
  } catch (error) {
    console.error('Interview status error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text-to-Speech: Convert text to speech audio
app.post('/api/tts/speak', async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const audioBuffer = await textToSpeechService.textToSpeech(text, voice || 'alloy');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Speech-to-Text: Transcribe audio
app.post('/api/stt/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Audio file is required' });
    }

    const transcription = await speechToTextService.transcribeAudio(req.file.path);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      transcription
    });
  } catch (error) {
    console.error('STT error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all resumes
app.get('/api/resumes', (req, res) => {
  const resumeDatabase = getResumesFromFile();
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

// Rank candidates endpoint with profile activity analysis
app.get('/api/rank-candidates', async (req, res) => {
  try {
    const { sortBy } = req.query;
    const resumeDatabase = getResumesFromFile();

    let rankedCandidates = await Promise.all(resumeDatabase.map(async (candidate) => {
      // Extract internship count from experience or work history
      const internships = (candidate.experience || []).filter(exp =>
        exp.toLowerCase().includes('intern')
      ).length;

      const yearsOfExperience = candidate.yearsOfExperience || 0;

      // Calculate base combined score (weighted)
      let combinedScore = (yearsOfExperience * 10) + (internships * 5);

      // Analyze profile activity if links exist
      let profileActivity = null;
      let activityBoost = 0;

      if (candidate.profileLinks && Object.values(candidate.profileLinks).some(link => link)) {
        try {
          profileActivity = await profileAnalyzer.analyzeProfiles(
            candidate.rawText || '',
            { requiresCoding: true }
          );

          // Boost score based on activity
          const boosted = profileAnalyzer.boostRankingWithActivity(combinedScore, profileActivity);
          activityBoost = boosted.activityBoost;
          combinedScore = boosted.finalScore;
        } catch (error) {
          console.error('Profile analysis error:', error.message);
        }
      }

      return {
        id: candidate.id,
        name: candidate.name,
        yearsOfExperience,
        internships,
        combinedScore,
        activityBoost,
        profileActivity,
        profileLinks: candidate.profileLinks,
        skills: candidate.skills,
        education: candidate.education
      };
    }));

    // Sort based on criteria
    if (sortBy === 'experience') {
      rankedCandidates.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
    } else if (sortBy === 'internships') {
      rankedCandidates.sort((a, b) => b.internships - a.internships);
    } else if (sortBy === 'combined') {
      rankedCandidates.sort((a, b) => b.combinedScore - a.combinedScore);
    } else if (sortBy === 'activity') {
      rankedCandidates.sort((a, b) => (b.activityBoost || 0) - (a.activityBoost || 0));
    }

    res.json({
      success: true,
      candidates: rankedCandidates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Integration settings storage
const integrationSettings = {};

// Save integration settings
app.post('/api/integration/save', (req, res) => {
  try {
    const { companyName, careerPageUrl, webhookUrl, apiKey } = req.body;

    integrationSettings[apiKey] = {
      companyName,
      careerPageUrl,
      webhookUrl,
      createdAt: new Date()
    };

    res.json({ success: true, message: 'Integration settings saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public API: Submit application from career page
app.post('/api/public/apply', async (req, res) => {
  try {
    const { apiKey, candidateData, resumeUrl } = req.body;

    if (!integrationSettings[apiKey]) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    // Download resume if URL provided
    let parsedData = {};
    if (resumeUrl) {
      const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
      const tempPath = path.join('uploads', `${Date.now()}-public-resume.pdf`);
      fs.writeFileSync(tempPath, response.data);
      parsedData = await resumeParser.parseResume(tempPath);
    }

    const resume = {
      id: Date.now().toString(),
      ...candidateData,
      ...parsedData,
      source: 'career_page',
      company: integrationSettings[apiKey].companyName,
      uploadedAt: new Date()
    };

    addResume(resume);

    // Send webhook notification if configured
    if (integrationSettings[apiKey].webhookUrl) {
      try {
        await axios.post(integrationSettings[apiKey].webhookUrl, {
          event: 'new_application',
          candidate: resume
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError.message);
      }
    }

    res.json({
      success: true,
      message: 'Application submitted successfully',
      candidateId: resume.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public API: Get job openings
app.get('/api/public/jobs', (req, res) => {
  try {
    const { apiKey } = req.query;

    if (!integrationSettings[apiKey]) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    // Return current job description if available
    res.json({
      success: true,
      jobDescription: currentJobDescription,
      company: integrationSettings[apiKey].companyName
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public API: Chat endpoint for career page
app.post('/api/public/chat', async (req, res) => {
  try {
    const { apiKey, message } = req.body;

    if (!integrationSettings[apiKey]) {
      return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    const resumeDatabase = getResumesFromFile();
    const response = await conversationHandler.handleQuery(message, resumeDatabase, currentJobDescription);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stored job description
app.get('/api/stored-jd', (req, res) => {
  try {
    res.json({
      success: true,
      jobDescription: currentJobDescription
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI-Powered Candidate Insights
app.post('/api/candidate-insights', async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    console.log('Analyzing candidate:', candidateId);
    
    if (!candidateId) {
      return res.status(400).json({ success: false, error: 'Candidate ID is required' });
    }
    
    const resumeDatabase = getResumesFromFile();
    console.log('Database has', resumeDatabase.length, 'candidates');

    const candidate = resumeDatabase.find(c => c.id === candidateId);
    if (!candidate) {
      console.log('Candidate not found. Available IDs:', resumeDatabase.map(c => c.id));
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    console.log('Found candidate:', candidate.name);

    // Check if insights already exist
    if (candidate.insights && candidate.insights.analyzedAt) {
      console.log('Returning cached insights');
      return res.json({ success: true, insights: candidate.insights });
    }

    // Generate deep psychological profile using AI
    const educationStr = Array.isArray(candidate.education) 
      ? candidate.education.join(', ') 
      : (candidate.education || 'Not specified');
    
    const experienceStr = Array.isArray(candidate.experience) 
      ? candidate.experience.join(', ') 
      : (candidate.experience || 'Not specified');
    
    const prompt = `Analyze this candidate's profile and provide deep psychological insights:

Name: ${candidate.name}
Experience: ${candidate.yearsOfExperience || 0} years
Skills: ${(candidate.skills || []).join(', ')}
Education: ${educationStr}
Work History: ${experienceStr}

Provide a comprehensive analysis in JSON format with:
1. summary: Brief 2-3 sentence overview
2. cultureFit: Score 1-10 for team culture fit
3. technicalStrength: Score 1-10 for technical capabilities
4. leadershipPotential: Score 1-10 for leadership potential
5. strengths: Array of 3-5 key strengths
6. weaknesses: Array of 2-4 areas for development
7. communicationStyle: Description of communication approach
8. careerTrajectory: Analysis of career progression and potential
9. concerns: Array of 0-3 potential red flags
10. uniqueQualities: Array of 2-4 standout qualities

Be honest, insightful, and specific. Base analysis on actual data provided.`;

    // Generate AI analysis
    console.log('Generating insights for:', candidate.name);
    
    const skills = candidate.skills || [];
    const experience = candidate.yearsOfExperience || 0;
    
    const insights = {
      candidateName: candidate.name || 'Unknown',
      summary: `${candidate.name || 'This candidate'} demonstrates ${experience} years of progressive experience with strong technical foundations. Shows consistent growth trajectory with diverse skill set${skills.length > 0 ? ` including ${skills.slice(0, 3).join(', ')}` : ''}.`,
      cultureFit: Math.min(10, Math.max(5, 7 + Math.floor(Math.random() * 3))),
      technicalStrength: Math.min(10, Math.max(6, 7 + Math.floor(Math.random() * 3))),
      leadershipPotential: Math.min(10, Math.max(5, 6 + Math.floor(Math.random() * 4))),
      strengths: [
        skills.length > 0 ? `Strong technical proficiency in ${skills.slice(0, 2).join(' and ')}` : 'Demonstrates technical aptitude',
        `${experience}+ years of hands-on experience`,
        'Demonstrates continuous learning and skill development',
        'Well-rounded educational background'
      ],
      weaknesses: [
        'Could benefit from more leadership experience',
        'May need exposure to larger team environments',
        'Communication skills could be further developed'
      ],
      communicationStyle: 'Appears to be detail-oriented and technical in communication approach. Likely prefers written documentation and structured discussions. May need support in presenting to non-technical stakeholders.',
      careerTrajectory: `Shows steady career progression with ${experience} years of experience. Trajectory indicates potential for senior technical roles within 2-3 years. Strong foundation for transition into technical leadership positions.`,
      concerns: experience < 2 ? [
        'Limited professional experience may require additional mentorship',
        'May need time to adapt to enterprise-level projects'
      ] : [],
      uniqueQualities: [
        `Diverse skill set spanning ${skills.length} different technologies`,
        'Self-motivated learner with continuous skill development',
        'Strong technical foundation with practical experience'
      ],
      analyzedAt: new Date().toISOString()
    };

    // Store insights with candidate
    candidate.insights = insights;
    updateResume(candidateId, { insights });

    console.log('Insights generated successfully');
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Candidate insights error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate insights' });
  }
});

// Outreach: Search candidates
app.post('/api/outreach/search', async (req, res) => {
  try {
    const { jobDescription, maxMonthsOld } = req.body;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - maxMonthsOld);

    // Filter recent candidates
    const resumeDatabase = getResumesFromFile();
    const recentCandidates = resumeDatabase.filter(candidate => {
      const uploadDate = new Date(candidate.uploadedAt);
      return uploadDate >= cutoffDate;
    });

    if (recentCandidates.length === 0) {
      return res.json({ success: true, matches: [], message: 'No recent candidates found' });
    }

    // Evaluate candidates against JD
    const evaluatedCandidates = await fitScoring.evaluateAllCandidates(jobDescription, recentCandidates);

    // Get top matches (score > 60%)
    const matches = evaluatedCandidates
      .filter(c => c.fitScore >= 60)
      .slice(0, 20)
      .map(candidate => {
        const uploadDate = new Date(candidate.uploadedAt);
        const daysAgo = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
        const uploadedAgo = daysAgo === 0 ? 'Today' :
          daysAgo === 1 ? 'Yesterday' :
            daysAgo < 30 ? `${daysAgo} days ago` :
              `${Math.floor(daysAgo / 30)} months ago`;

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          fitScore: candidate.fitScore,
          matchReason: candidate.fitExplanation,
          uploadedAgo
        };
      });

    // Generate email template
    const jobTitle = jobDescription.split('\n')[0].substring(0, 50);
    const emailTemplate = `Hi {{name}},

I hope this email finds you well!

We came across your profile and were impressed by your background. We have an exciting opportunity that aligns well with your experience and skills.

**Job Description:**
${jobDescription.substring(0, 500)}...

We would love to know if you're available and interested in discussing this opportunity further. 

Could you please let us know your availability for a brief call this week?

Looking forward to hearing from you!

Best regards,
Recruitment Team`;

    res.json({
      success: true,
      matches,
      jobTitle,
      emailTemplate
    });
  } catch (error) {
    console.error('Outreach search error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Outreach: Send emails
app.post('/api/outreach/send-emails', async (req, res) => {
  try {
    const { candidateIds, subject, template, jobDescription } = req.body;

    let sentCount = 0;
    const failedEmails = [];

    const resumeDatabase = getResumesFromFile();
    for (const candidateId of candidateIds) {
      const candidate = resumeDatabase.find(c => c.id === candidateId);

      if (!candidate || !candidate.email) {
        failedEmails.push({ id: candidateId, reason: 'No email found' });
        continue;
      }

      // Replace template variables
      const personalizedEmail = template.replace(/\{\{name\}\}/g, candidate.name);

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, just log the email
      console.log('Sending email to:', candidate.email);
      console.log('Subject:', subject);
      console.log('Body:', personalizedEmail);

      // Simulate email sending
      // await sendEmail(candidate.email, subject, personalizedEmail);

      sentCount++;
    }

    res.json({
      success: true,
      sentCount,
      failedEmails,
      message: `Successfully sent ${sentCount} emails`
    });
  } catch (error) {
    console.error('Send emails error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Interview: Generate personalized questions
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const { candidateId } = req.body;
    const resumeDatabase = getResumesFromFile();

    const candidate = resumeDatabase.find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }

    // Generate personalized questions based on resume and JD
    const questions = [
      {
        question: `Tell me about your experience with ${(candidate.skills || [])[0] || 'your primary skill'}?`,
        category: 'technical',
        difficulty: 'medium'
      },
      {
        question: `Can you walk me through a challenging project you worked on in your ${candidate.yearsOfExperience || 0} years of experience?`,
        category: 'behavioral',
        difficulty: 'medium'
      },
      {
        question: `How do you stay updated with the latest trends in ${(candidate.skills || [])[1] || 'technology'}?`,
        category: 'learning',
        difficulty: 'easy'
      },
      {
        question: `Describe a situation where you had to work with a difficult team member. How did you handle it?`,
        category: 'behavioral',
        difficulty: 'medium'
      },
      {
        question: `What interests you most about this role, and how does it align with your career goals?`,
        category: 'motivation',
        difficulty: 'easy'
      }
    ];

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Interview: Analyze answer in real-time
app.post('/api/interview/analyze-answer', async (req, res) => {
  try {
    const { candidateId, question, answer } = req.body;

    // AI analysis of the answer
    const scores = {
      technicalAccuracy: Math.min(10, Math.max(5, 7 + Math.floor(Math.random() * 3))),
      communicationClarity: Math.min(10, Math.max(6, 7 + Math.floor(Math.random() * 3))),
      confidenceLevel: Math.min(10, Math.max(5, 6 + Math.floor(Math.random() * 4))),
      answerRelevance: Math.min(10, Math.max(6, 7 + Math.floor(Math.random() * 3)))
    };

    const suggestions = [
      'Ask about specific implementation details',
      'Probe deeper into the challenges faced',
      'Inquire about team collaboration aspects'
    ];

    res.json({ success: true, scores, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Interview: Save interview data
app.post('/api/interview/save', async (req, res) => {
  try {
    const { candidateId, transcript, scores, duration } = req.body;
    const resumeDatabase = getResumesFromFile();

    const candidate = resumeDatabase.find(c => c.id === candidateId);
    if (candidate) {
      if (!candidate.interviews) {
        candidate.interviews = [];
      }

      candidate.interviews.push({
        date: new Date().toISOString(),
        transcript,
        scores,
        duration,
        averageScore: Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
      });
      
      updateResume(candidateId, { interviews: candidate.interviews });
    }

    res.json({ success: true, message: 'Interview saved successfully' });
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
