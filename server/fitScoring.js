const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function calculateFitScore(jobDescription, candidate) {
  const prompt = `Job Description:
${jobDescription}

Candidate Profile:
Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.yearsOfExperience} years
Education: ${candidate.education}
Summary: ${candidate.experience.substring(0, 500)}

Evaluate this candidate's fit for the job on a scale of 0-100%. Provide:
1. Fit Score (0-100%)
2. Brief explanation (2-3 sentences)
3. Key strengths
4. Gaps or concerns

Format as JSON:
{
  "score": 85,
  "explanation": "Strong match with...",
  "strengths": ["skill1", "skill2"],
  "gaps": ["gap1"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Fit scoring error:', error);
    return calculateFitScoreLocally(jobDescription, candidate);
  }
}

function calculateFitScoreLocally(jobDescription, candidate) {
  const jdLower = jobDescription.toLowerCase();
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'sql', 'docker'];
  const requiredSkills = commonSkills.filter(skill => jdLower.includes(skill));
  
  const matchedSkills = requiredSkills.filter(skill => 
    candidateSkills.some(cs => cs.includes(skill))
  );
  
  const skillScore = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 70 
    : 50;
  
  const experienceScore = Math.min(candidate.yearsOfExperience * 5, 30);
  const totalScore = Math.round(skillScore + experienceScore);
  
  return {
    score: totalScore,
    explanation: `Matched ${matchedSkills.length}/${requiredSkills.length} key skills. ${candidate.yearsOfExperience} years experience.`,
    strengths: matchedSkills,
    gaps: requiredSkills.filter(s => !matchedSkills.includes(s))
  };
}

async function evaluateAllCandidates(jobDescription, candidates) {
  const evaluations = await Promise.all(
    candidates.map(async (candidate) => {
      const fitScore = await calculateFitScore(jobDescription, candidate);
      return {
        ...candidate,
        fitScore: fitScore.score,
        fitExplanation: fitScore.explanation,
        strengths: fitScore.strengths,
        gaps: fitScore.gaps
      };
    })
  );
  
  return evaluations.sort((a, b) => b.fitScore - a.fitScore);
}

module.exports = { calculateFitScore, evaluateAllCandidates };
