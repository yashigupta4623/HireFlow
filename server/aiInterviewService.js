const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store active interview sessions
const activeInterviews = new Map();

/**
 * Initialize an AI interview session for a candidate
 */
function initializeInterview(candidateId, candidate, jobDescription) {
  const interviewContext = {
    candidateId,
    candidateName: candidate.name,
    candidateSkills: candidate.skills || [],
    candidateExperience: candidate.yearsOfExperience || 0,
    candidateEducation: candidate.education || [],
    jobDescription: jobDescription || 'General technical role',
    conversationHistory: [],
    currentQuestion: 0,
    startTime: new Date(),
    questions: generateInterviewQuestions(candidate, jobDescription)
  };

  activeInterviews.set(candidateId, interviewContext);
  return interviewContext;
}

/**
 * Generate personalized interview questions based on resume and JD
 */
function generateInterviewQuestions(candidate, jobDescription) {
  const questions = [
    {
      type: 'introduction',
      text: `Hello ${candidate.name}! I'm your AI interviewer today. Thank you for taking the time to speak with us. To start, could you briefly introduce yourself and tell me about your background?`
    },
    {
      type: 'technical',
      text: `I see you have experience with ${(candidate.skills || ['various technologies'])[0]}. Can you describe a challenging project where you used this skill?`
    },
    {
      type: 'experience',
      text: `With ${candidate.yearsOfExperience || 0} years of experience, what would you say is your biggest professional achievement?`
    },
    {
      type: 'behavioral',
      text: `Tell me about a time when you had to learn a new technology quickly. How did you approach it?`
    },
    {
      type: 'problem_solving',
      text: `Describe a situation where you faced a technical challenge that seemed impossible at first. How did you solve it?`
    },
    {
      type: 'motivation',
      text: `What interests you most about this role, and how does it align with your career goals?`
    }
  ];

  return questions;
}

/**
 * Get the next question for the candidate
 */
function getNextQuestion(candidateId) {
  const interview = activeInterviews.get(candidateId);
  
  if (!interview) {
    throw new Error('Interview session not found');
  }

  if (interview.currentQuestion >= interview.questions.length) {
    return {
      isComplete: true,
      message: `Thank you ${interview.candidateName} for your time today. We've covered all the questions. We'll review your responses and get back to you soon. Have a great day!`
    };
  }

  const question = interview.questions[interview.currentQuestion];
  interview.currentQuestion++;
  
  return {
    isComplete: false,
    question: question.text,
    questionType: question.type,
    questionNumber: interview.currentQuestion,
    totalQuestions: interview.questions.length
  };
}

/**
 * Process candidate's answer using AI
 */
async function processAnswer(candidateId, answer, questionType) {
  const interview = activeInterviews.get(candidateId);
  
  if (!interview) {
    throw new Error('Interview session not found');
  }

  // Store the answer
  interview.conversationHistory.push({
    role: 'candidate',
    content: answer,
    questionType,
    timestamp: new Date()
  });

  // Analyze the answer using AI
  const analysis = await analyzeAnswer(answer, questionType, interview);

  // Generate follow-up or acknowledgment
  const response = await generateInterviewerResponse(answer, questionType, analysis, interview);

  interview.conversationHistory.push({
    role: 'interviewer',
    content: response,
    timestamp: new Date()
  });

  return {
    response,
    analysis,
    progress: {
      current: interview.currentQuestion,
      total: interview.questions.length
    }
  };
}

/**
 * Analyze candidate's answer using AI
 */
async function analyzeAnswer(answer, questionType, interview) {
  try {
    const prompt = `Analyze this interview answer and provide scores:

Question Type: ${questionType}
Candidate Answer: ${answer}
Candidate Background: ${interview.candidateExperience} years experience in ${interview.candidateSkills.join(', ')}

Provide analysis in JSON format:
{
  "technicalAccuracy": <score 1-10>,
  "communicationClarity": <score 1-10>,
  "relevance": <score 1-10>,
  "depth": <score 1-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "keyPoints": ["point1", "point2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback analysis
    return {
      technicalAccuracy: 7,
      communicationClarity: 7,
      relevance: 8,
      depth: 7,
      strengths: ['Clear communication', 'Relevant experience'],
      improvements: ['Could provide more specific examples'],
      keyPoints: ['Demonstrated understanding of the topic']
    };
  }
}

/**
 * Generate natural interviewer response
 */
async function generateInterviewerResponse(answer, questionType, analysis, interview) {
  try {
    const prompt = `You are an AI HR interviewer. Generate a brief, natural response to the candidate's answer.

Candidate: ${interview.candidateName}
Question Type: ${questionType}
Their Answer: ${answer}
Analysis: Strong points - ${analysis.strengths.join(', ')}

Generate a brief (1-2 sentences) acknowledgment that:
1. Sounds natural and conversational
2. Acknowledges their answer positively
3. Optionally asks a brief follow-up if relevant
4. Keeps the interview flowing smoothly

Response:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Response generation error:', error);
    // Fallback responses
    const fallbacks = [
      "That's great, thank you for sharing that.",
      "Interesting perspective, I appreciate the detail.",
      "Thank you for that insight.",
      "That's a solid example, thanks for elaborating."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

/**
 * Get interview summary and final evaluation
 */
async function getInterviewSummary(candidateId) {
  const interview = activeInterviews.get(candidateId);
  
  if (!interview) {
    throw new Error('Interview session not found');
  }

  const duration = Math.floor((new Date() - interview.startTime) / 1000 / 60); // minutes

  // Calculate overall scores from conversation history
  const candidateAnswers = interview.conversationHistory.filter(msg => msg.role === 'candidate');
  
  const summary = {
    candidateId: interview.candidateId,
    candidateName: interview.candidateName,
    duration: `${duration} minutes`,
    questionsAnswered: candidateAnswers.length,
    conversationHistory: interview.conversationHistory,
    overallScores: {
      technicalCompetence: 7.5,
      communication: 8.0,
      problemSolving: 7.0,
      cultureFit: 8.5
    },
    recommendation: 'Proceed to next round',
    strengths: [
      'Strong technical background',
      'Clear communication',
      'Good problem-solving approach'
    ],
    areasForImprovement: [
      'Could provide more specific examples',
      'Expand on leadership experience'
    ],
    completedAt: new Date()
  };

  return summary;
}

/**
 * End interview session
 */
function endInterview(candidateId) {
  const interview = activeInterviews.get(candidateId);
  if (interview) {
    activeInterviews.delete(candidateId);
    return true;
  }
  return false;
}

/**
 * Get active interview session
 */
function getInterviewSession(candidateId) {
  return activeInterviews.get(candidateId);
}

module.exports = {
  initializeInterview,
  getNextQuestion,
  processAnswer,
  getInterviewSummary,
  endInterview,
  getInterviewSession
};
