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
  
  // Extract keywords from JD
  const allSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'aws', 'sql', 'docker',
    'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
    'redis', 'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd',
    'git', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
    'cloud', 'azure', 'gcp', 'linux', 'jenkins', 'terraform', 'ansible'
  ];
  
  const requiredSkills = allSkills.filter(skill => jdLower.includes(skill));
  
  // 1. Skill Match Score (40 points)
  const matchedSkills = requiredSkills.filter(skill => 
    candidateSkills.some(cs => cs.includes(skill))
  );
  
  const skillMatchScore = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 40 
    : 20;
  
  // 2. Experience Score (25 points)
  const experienceScore = Math.min(candidate.yearsOfExperience * 4, 25);
  
  // 3. Total Skills Count (15 points) - More skills = better
  const totalSkillsScore = Math.min((candidate.skills.length / 20) * 15, 15);
  
  // 4. Education Score (10 points)
  const educationLower = (candidate.education || '').toLowerCase();
  let educationScore = 5; // Base score
  if (educationLower.includes('master') || educationLower.includes('phd')) {
    educationScore = 10;
  } else if (educationLower.includes('bachelor') || educationLower.includes('b.tech') || educationLower.includes('b.e')) {
    educationScore = 8;
  }
  
  // 5. Keyword Density Score (10 points) - How many times skills appear
  let keywordDensity = 0;
  matchedSkills.forEach(skill => {
    const count = candidateSkills.filter(cs => cs.includes(skill)).length;
    keywordDensity += count;
  });
  const densityScore = Math.min((keywordDensity / matchedSkills.length) * 10, 10);
  
  // Calculate total with some randomization for differentiation (±2 points)
  const baseScore = skillMatchScore + experienceScore + totalSkillsScore + educationScore + densityScore;
  const randomAdjustment = (Math.random() * 4) - 2; // -2 to +2
  const totalScore = Math.round(Math.max(0, Math.min(100, baseScore + randomAdjustment)));
  
  return {
    score: totalScore,
    explanation: `Matched ${matchedSkills.length}/${requiredSkills.length} key skills with ${candidate.yearsOfExperience} years experience. ${candidate.skills.length} total skills identified.`,
    strengths: matchedSkills.slice(0, 5),
    gaps: requiredSkills.filter(s => !matchedSkills.includes(s)).slice(0, 3)
  };
}

async function evaluateAllCandidates(jobDescription, candidates) {
  console.log(`\n=== Evaluating ${candidates.length} candidates ===`);
  
  const evaluations = await Promise.all(
    candidates.map(async (candidate) => {
      // Log input candidate
      console.log(`Input candidate ${candidate.name}: has email=${!!candidate.email} (${candidate.email})`);
      
      const fitScore = await calculateFitScore(jobDescription, candidate);
      const result = {
        // Explicitly preserve all fields
        id: candidate.id,
        filename: candidate.filename,
        sourceLink: candidate.sourceLink,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        skills: candidate.skills,
        education: candidate.education,
        yearsOfExperience: candidate.yearsOfExperience,
        experience: candidate.experience,
        // Add scoring results
        fitScore: fitScore.score,
        fitExplanation: fitScore.explanation,
        strengths: fitScore.strengths,
        gaps: fitScore.gaps
      };
      
      // Debug logging
      console.log(`Output result ${result.name}: has email=${!!result.email} (${result.email})`);
      
      return result;
    })
  );
  
  // Sort by fitScore (primary), then by experience (secondary), then by skills count (tertiary)
  return evaluations.sort((a, b) => {
    if (b.fitScore !== a.fitScore) {
      return b.fitScore - a.fitScore;
    }
    if (b.yearsOfExperience !== a.yearsOfExperience) {
      return b.yearsOfExperience - a.yearsOfExperience;
    }
    return b.skills.length - a.skills.length;
  });
}

module.exports = { calculateFitScore, evaluateAllCandidates };
