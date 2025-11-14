/**
 * Test script for AI Interview functionality
 * Run with: node test-ai-interview.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let testCandidateId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test1_uploadResume() {
  log('\n📄 Test 1: Upload Resume', 'blue');
  
  try {
    const FormData = require('form-data');
    const fs = require('fs');
    
    // Create a test resume file
    const testResume = `
John Doe
Software Engineer
Email: john.doe@example.com
Phone: (555) 123-4567

EXPERIENCE:
Senior Software Engineer at Tech Corp (2020-2023)
- Led development of microservices architecture
- Managed team of 5 developers
- Implemented CI/CD pipelines

Software Engineer at StartupXYZ (2018-2020)
- Built React applications
- Developed REST APIs with Node.js

SKILLS:
JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL

EDUCATION:
Bachelor of Science in Computer Science
University of Technology (2014-2018)
`;
    
    fs.writeFileSync('test-resume.txt', testResume);
    
    const formData = new FormData();
    formData.append('resume', fs.createReadStream('test-resume.txt'));
    
    const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    if (response.data.success) {
      testCandidateId = response.data.resumeId;
      log(`✅ Resume uploaded successfully`, 'green');
      log(`   Candidate ID: ${testCandidateId}`, 'yellow');
      log(`   Candidate Name: ${response.data.candidateName}`, 'yellow');
    } else {
      log(`❌ Failed to upload resume`, 'red');
    }
    
    // Clean up
    fs.unlinkSync('test-resume.txt');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test2_startInterview() {
  log('\n🎤 Test 2: Start AI Interview', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai-interview/start`, {
      candidateId: testCandidateId
    });
    
    if (response.data.success) {
      log(`✅ Interview started successfully`, 'green');
      log(`   Channel: ${response.data.channelName}`, 'yellow');
      log(`   Candidate: ${response.data.candidateName}`, 'yellow');
      log(`   Total Questions: ${response.data.totalQuestions}`, 'yellow');
      log(`   First Question: "${response.data.firstQuestion.substring(0, 80)}..."`, 'yellow');
    } else {
      log(`❌ Failed to start interview`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test3_processAnswer() {
  log('\n💬 Test 3: Process Candidate Answer', 'blue');
  
  try {
    const testAnswer = "I have over 5 years of experience working with JavaScript and React. In my most recent role at Tech Corp, I led the development of a microservices architecture that improved our system's scalability by 300%. I'm passionate about clean code and best practices.";
    
    const response = await axios.post(`${BASE_URL}/api/ai-interview/process-answer`, {
      candidateId: testCandidateId,
      answer: testAnswer,
      questionType: 'introduction'
    });
    
    if (response.data.success) {
      log(`✅ Answer processed successfully`, 'green');
      log(`   AI Response: "${response.data.response}"`, 'yellow');
      log(`   Analysis:`, 'yellow');
      log(`     - Technical Accuracy: ${response.data.analysis.technicalAccuracy}/10`, 'yellow');
      log(`     - Communication: ${response.data.analysis.communicationClarity}/10`, 'yellow');
      log(`     - Relevance: ${response.data.analysis.relevance}/10`, 'yellow');
      log(`     - Depth: ${response.data.analysis.depth}/10`, 'yellow');
    } else {
      log(`❌ Failed to process answer`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test4_getNextQuestion() {
  log('\n❓ Test 4: Get Next Question', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai-interview/next-question`, {
      candidateId: testCandidateId
    });
    
    if (response.data.success) {
      if (response.data.isComplete) {
        log(`✅ Interview completed`, 'green');
        log(`   Message: "${response.data.message}"`, 'yellow');
      } else {
        log(`✅ Next question retrieved`, 'green');
        log(`   Question ${response.data.questionNumber}/${response.data.totalQuestions}`, 'yellow');
        log(`   Type: ${response.data.questionType}`, 'yellow');
        log(`   Question: "${response.data.question.substring(0, 80)}..."`, 'yellow');
      }
    } else {
      log(`❌ Failed to get next question`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test5_getInterviewStatus() {
  log('\n📊 Test 5: Get Interview Status', 'blue');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/ai-interview/status/${testCandidateId}`);
    
    if (response.data.success) {
      if (response.data.active) {
        log(`✅ Interview session is active`, 'green');
        log(`   Candidate: ${response.data.candidateName}`, 'yellow');
        log(`   Progress: ${response.data.currentQuestion}/${response.data.totalQuestions}`, 'yellow');
        log(`   Started: ${new Date(response.data.startTime).toLocaleString()}`, 'yellow');
      } else {
        log(`✅ No active interview session`, 'green');
      }
    } else {
      log(`❌ Failed to get status`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test6_getInterviewSummary() {
  log('\n📋 Test 6: Get Interview Summary', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai-interview/summary`, {
      candidateId: testCandidateId
    });
    
    if (response.data.success) {
      const summary = response.data.summary;
      log(`✅ Interview summary generated`, 'green');
      log(`   Candidate: ${summary.candidateName}`, 'yellow');
      log(`   Duration: ${summary.duration}`, 'yellow');
      log(`   Questions Answered: ${summary.questionsAnswered}`, 'yellow');
      log(`   Overall Scores:`, 'yellow');
      log(`     - Technical: ${summary.overallScores.technicalCompetence}/10`, 'yellow');
      log(`     - Communication: ${summary.overallScores.communication}/10`, 'yellow');
      log(`     - Problem Solving: ${summary.overallScores.problemSolving}/10`, 'yellow');
      log(`     - Culture Fit: ${summary.overallScores.cultureFit}/10`, 'yellow');
      log(`   Recommendation: ${summary.recommendation}`, 'yellow');
    } else {
      log(`❌ Failed to get summary`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test7_endInterview() {
  log('\n🏁 Test 7: End Interview', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai-interview/end`, {
      candidateId: testCandidateId
    });
    
    if (response.data.success) {
      log(`✅ ${response.data.message}`, 'green');
    } else {
      log(`❌ Failed to end interview`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function test8_textToSpeech() {
  log('\n🔊 Test 8: Text-to-Speech', 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/tts/speak`, {
      text: "Hello, welcome to your AI interview. Let's get started!",
      voice: "alloy"
    }, {
      responseType: 'arraybuffer'
    });
    
    if (response.data) {
      const fs = require('fs');
      fs.writeFileSync('test-tts-output.mp3', response.data);
      log(`✅ TTS audio generated successfully`, 'green');
      log(`   Saved to: test-tts-output.mp3`, 'yellow');
      log(`   Play this file to hear the AI voice`, 'yellow');
    } else {
      log(`❌ Failed to generate TTS`, 'red');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('='.repeat(60), 'blue');
  log('🧪 AI Interview Backend Test Suite', 'blue');
  log('='.repeat(60), 'blue');
  
  log('\n⚠️  Make sure your server is running on http://localhost:3001', 'yellow');
  log('⚠️  Make sure .env has OPENAI_API_KEY and AGORA credentials', 'yellow');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await test1_uploadResume();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!testCandidateId) {
    log('\n❌ Cannot continue tests without candidate ID', 'red');
    return;
  }
  
  await test2_startInterview();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test3_processAnswer();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test4_getNextQuestion();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test5_getInterviewStatus();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test6_getInterviewSummary();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test7_endInterview();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await test8_textToSpeech();
  
  log('\n' + '='.repeat(60), 'blue');
  log('✅ All tests completed!', 'green');
  log('='.repeat(60), 'blue');
  
  log('\n📝 Next Steps:', 'blue');
  log('1. Check test-tts-output.mp3 to hear AI voice', 'yellow');
  log('2. Integrate with frontend (LiveInterview.jsx)', 'yellow');
  log('3. Test with real Agora voice connection', 'yellow');
  log('4. Review AI_INTERVIEW_API.md for full documentation', 'yellow');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
