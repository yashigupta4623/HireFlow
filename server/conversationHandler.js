const OpenAI = require('openai');
const { compareCandidates } = require('./comparison');
const { findCandidatesBySkills, getSkillStatistics } = require('./skillMatrix');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function handleQuery(query, resumeDatabase, jobDescription = null) {
  const context = resumeDatabase.map((resume, idx) => 
    `Candidate ${idx + 1}: ${resume.name}
    Skills: ${resume.skills.join(', ')}
    Experience: ${resume.yearsOfExperience} years
    Education: ${resume.education}
    Email: ${resume.email}`
  ).join('\n\n');

  const systemPrompt = `You are an AI recruitment assistant. You have access to a database of candidate resumes. 
Answer questions about candidates based on their skills, experience, education, and qualifications.
Be concise and helpful. When recommending candidates, explain why they're a good fit.

Available candidates:
${context}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return handleQueryLocally(query, resumeDatabase);
  }
}

async function handleQueryLocally(query, resumeDatabase) {
  const lowerQuery = query.toLowerCase();
  
  // Compare candidates
  if (lowerQuery.includes('compare')) {
    const names = resumeDatabase.map(r => r.name);
    const foundNames = names.filter(name => 
      lowerQuery.includes(name.toLowerCase())
    );
    
    if (foundNames.length >= 2) {
      const c1 = resumeDatabase.find(r => r.name === foundNames[0]);
      const c2 = resumeDatabase.find(r => r.name === foundNames[1]);
      return await compareCandidates(c1, c2);
    }
  }
  
  // Statistics and insights
  if (lowerQuery.includes('breakdown') || lowerQuery.includes('statistics') || 
      lowerQuery.includes('average') || lowerQuery.includes('top skills')) {
    const stats = getSkillStatistics(resumeDatabase);
    return `📊 Talent Pool Insights:\n\n` +
      `Total Candidates: ${stats.totalCandidates}\n` +
      `Average Experience: ${stats.averageExperience} years\n` +
      `Unique Skills: ${stats.totalUniqueSkills}\n\n` +
      `Top 10 Skills:\n` +
      stats.topSkills.map((s, i) => `${i + 1}. ${s.skill} (${s.count} candidates)`).join('\n');
  }
  
  // Skill-based search
  if (lowerQuery.includes('skill') || lowerQuery.includes('know') || 
      lowerQuery.includes('strongest in')) {
    const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'sql'];
    const requestedSkills = commonSkills.filter(skill => lowerQuery.includes(skill));
    
    if (requestedSkills.length > 0) {
      const matches = findCandidatesBySkills(resumeDatabase, requestedSkills);
      if (matches.length > 0) {
        return `Found ${matches.length} candidate(s) with ${requestedSkills.join(' and ')}:\n\n` +
          matches.slice(0, 5).map((r, i) => 
            `${i + 1}. ${r.name} - ${r.matchPercentage.toFixed(0)}% match\n` +
            `   Skills: ${r.matchedSkills.join(', ')}`
          ).join('\n\n');
      }
    }
  }
  
  // Experience-based search
  if (lowerQuery.includes('year') || lowerQuery.includes('experience')) {
    const yearMatch = lowerQuery.match(/(\d+)\s*(?:\+)?\s*year/);
    if (yearMatch) {
      const requiredYears = parseInt(yearMatch[1]);
      const matches = resumeDatabase.filter(r => r.yearsOfExperience >= requiredYears);
      return `Found ${matches.length} candidate(s) with ${requiredYears}+ years of experience:\n` +
        matches.map(r => `- ${r.name}: ${r.yearsOfExperience} years`).join('\n');
    }
  }
  
  return `I found ${resumeDatabase.length} resumes in the database. Try asking:\n` +
    `- "Who has Python and React skills?"\n` +
    `- "Show me candidates with 5+ years experience"\n` +
    `- "Compare [Name1] and [Name2]"\n` +
    `- "Give me a breakdown of top skills"`;
}

module.exports = { handleQuery };
