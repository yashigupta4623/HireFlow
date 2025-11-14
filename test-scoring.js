#!/usr/bin/env node

/**
 * Test Scoring Algorithm
 * Tests the fit scoring with actual resume data
 */

const fs = require('fs');
const path = require('path');

// Load resumes
const resumesPath = path.join(__dirname, 'resumes.json');
const resumes = JSON.parse(fs.readFileSync(resumesPath, 'utf8'));

console.log('📊 Testing Scoring Algorithm\n');
console.log(`Found ${resumes.length} candidates in resumes.json\n`);

// Sample Job Description
const jobDescription = `
We are looking for a Full Stack Developer with the following skills:
- Strong experience in React.js and Node.js
- Experience with MongoDB and Express.js
- Knowledge of AWS cloud services
- Familiarity with Docker and CI/CD
- Experience with Python and Java
- Understanding of DevOps practices
- Git and GitHub proficiency
- RESTful API development
- 3+ years of experience required
`;

console.log('📋 Job Description:');
console.log(jobDescription);
console.log('\n' + '='.repeat(80) + '\n');

// Scoring function (same as in fitScoring.js)
function calculateScore(jd, candidate) {
  const jdLower = jd.toLowerCase();
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  
  // Extract keywords from JD
  const allSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'aws', 'sql', 'docker',
    'kubernetes', 'typescript', 'angular', 'vue', 'mongodb', 'postgresql',
    'redis', 'graphql', 'rest', 'api', 'microservices', 'devops', 'ci/cd',
    'git', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
    'cloud', 'azure', 'gcp', 'linux', 'jenkins', 'terraform', 'ansible',
    'express', 'flask', 'django', 'spring boot'
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
  
  // 3. Total Skills Count (15 points)
  const totalSkillsScore = Math.min((candidate.skills.length / 20) * 15, 15);
  
  // 4. Education Score (10 points)
  const educationLower = (candidate.education || '').toLowerCase();
  let educationScore = 5;
  if (educationLower.includes('master') || educationLower.includes('phd')) {
    educationScore = 10;
  } else if (educationLower.includes('bachelor') || educationLower.includes('b.tech') || educationLower.includes('b.e')) {
    educationScore = 8;
  }
  
  // 5. Keyword Density Score (10 points)
  let keywordDensity = 0;
  matchedSkills.forEach(skill => {
    const count = candidateSkills.filter(cs => cs.includes(skill)).length;
    keywordDensity += count;
  });
  const densityScore = matchedSkills.length > 0 
    ? Math.min((keywordDensity / matchedSkills.length) * 10, 10) 
    : 0;
  
  // Calculate total
  const baseScore = skillMatchScore + experienceScore + totalSkillsScore + educationScore + densityScore;
  const totalScore = Math.round(Math.max(0, Math.min(100, baseScore)));
  
  return {
    score: totalScore,
    breakdown: {
      skillMatch: Math.round(skillMatchScore),
      experience: Math.round(experienceScore),
      totalSkills: Math.round(totalSkillsScore),
      education: educationScore,
      density: Math.round(densityScore)
    },
    matchedSkills: matchedSkills,
    requiredSkills: requiredSkills,
    missingSkills: requiredSkills.filter(s => !matchedSkills.includes(s))
  };
}

// Score all candidates
const scoredCandidates = resumes.map(candidate => {
  const result = calculateScore(jobDescription, candidate);
  return {
    name: candidate.name,
    score: result.score,
    breakdown: result.breakdown,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    yearsOfExperience: candidate.yearsOfExperience,
    totalSkills: candidate.skills.length
  };
});

// Sort by score
scoredCandidates.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  if (b.yearsOfExperience !== a.yearsOfExperience) return b.yearsOfExperience - a.yearsOfExperience;
  return b.totalSkills - a.totalSkills;
});

// Display results
console.log('🏆 RANKED CANDIDATES\n');

scoredCandidates.forEach((candidate, index) => {
  const rank = index + 1;
  const emoji = candidate.score >= 85 ? '🟢' : 
                candidate.score >= 75 ? '🟢' :
                candidate.score >= 50 ? '🔵' :
                candidate.score >= 40 ? '🟡' : '🔴';
  
  console.log(`#${rank} ${emoji} ${candidate.name}`);
  console.log(`   Score: ${candidate.score}% JD Match`);
  console.log(`   Breakdown:`);
  console.log(`     • Skill Match:    ${candidate.breakdown.skillMatch}/40`);
  console.log(`     • Experience:     ${candidate.breakdown.experience}/25 (${candidate.yearsOfExperience} years)`);
  console.log(`     • Total Skills:   ${candidate.breakdown.totalSkills}/15 (${candidate.totalSkills} skills)`);
  console.log(`     • Education:      ${candidate.breakdown.education}/10`);
  console.log(`     • Keyword Density: ${candidate.breakdown.density}/10`);
  console.log(`   Matched Skills (${candidate.matchedSkills.length}): ${candidate.matchedSkills.slice(0, 10).join(', ')}${candidate.matchedSkills.length > 10 ? '...' : ''}`);
  if (candidate.missingSkills.length > 0) {
    console.log(`   Missing Skills (${candidate.missingSkills.length}): ${candidate.missingSkills.slice(0, 5).join(', ')}${candidate.missingSkills.length > 5 ? '...' : ''}`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log('\n✅ Scoring test complete!\n');
