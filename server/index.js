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
    
    // Extract profile links from resume text
    const profileLinks = profileAnalyzer.extractProfileLinks(parsedData.rawText || '');
    
    const resume = {
      id: Date.now().toString(),
      filename: req.file.originalname,
      ...parsedData,
      profileLinks,
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

// Rank candidates endpoint with profile activity analysis
app.get('/api/rank-candidates', async (req, res) => {
  try {
    const { sortBy } = req.query;
    
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
    
    resumeDatabase.push(resume);
    
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

// Outreach: Search candidates
app.post('/api/outreach/search', async (req, res) => {
  try {
    const { jobDescription, maxMonthsOld } = req.body;
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - maxMonthsOld);
    
    // Filter recent candidates
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

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
