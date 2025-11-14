const OpenAI = require('openai');
const { compareCandidates } = require('./comparison');
const { findCandidatesBySkills, getSkillStatistics } = require('./skillMatrix');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function handleQuery(query, resumeDatabase, jobDescription = null) {
  // First try local handling for better accuracy
  const localResult = await handleQueryLocally(query, resumeDatabase);
  
  // If local handling found specific results, return them
  if (!localResult.includes('Try asking')) {
    return localResult;
  }

  // Otherwise use AI for more complex queries
  const context = resumeDatabase.map((resume, idx) => 
    `Candidate ${idx + 1}: ${resume.name}
    Skills: ${resume.skills.join(', ')}
    Experience: ${resume.yearsOfExperience} years
    Education: ${resume.education}
    Email: ${resume.email}
    Location: ${resume.location || 'Not specified'}`
  ).join('\n\n');

  const systemPrompt = `You are an AI recruitment assistant with access to a candidate database. 
IMPORTANT: Always provide SPECIFIC information from the actual candidates listed below. Never make up or assume information.

When answering:
1. Use ONLY the candidate data provided below
2. Include actual names, skills, and experience from the database
3. Be specific with numbers and details
4. If asked about skills, list the exact candidates who have those skills
5. If no candidates match, say so clearly

Available candidates in database:
${context}

Total candidates: ${resumeDatabase.length}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return localResult;
  }
}

async function handleQueryLocally(query, resumeDatabase) {
  const lowerQuery = query.toLowerCase();
  
  // List all candidates
  if (lowerQuery.includes('list all') || lowerQuery.includes('show all') || lowerQuery.includes('all candidates')) {
    return `Found ${resumeDatabase.length} candidates in database:\n\n` +
      resumeDatabase.map((r, i) => 
        `${i + 1}. ${r.name}\n` +
        `   Skills: ${r.skills.slice(0, 5).join(', ')}${r.skills.length > 5 ? '...' : ''}\n` +
        `   Experience: ${r.yearsOfExperience} years\n` +
        `   Email: ${r.email}`
      ).join('\n\n');
  }
  
  // Compare candidates
  if (lowerQuery.includes('compare')) {
    // Check for "top 2" or "top candidates" pattern
    if (lowerQuery.includes('top') && resumeDatabase.length >= 2) {
      // Sort by experience and take top 2
      const sortedCandidates = [...resumeDatabase].sort((a, b) => 
        (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
      );
      const c1 = sortedCandidates[0];
      const c2 = sortedCandidates[1];
      return await compareCandidates(c1, c2);
    }
    
    // Check for specific names
    const names = resumeDatabase.map(r => r.name);
    const foundNames = names.filter(name => 
      lowerQuery.includes(name.toLowerCase())
    );
    
    if (foundNames.length >= 2) {
      const c1 = resumeDatabase.find(r => r.name === foundNames[0]);
      const c2 = resumeDatabase.find(r => r.name === foundNames[1]);
      return await compareCandidates(c1, c2);
    }
    
    // If just "compare" without specifics, compare first 2
    if (resumeDatabase.length >= 2) {
      return await compareCandidates(resumeDatabase[0], resumeDatabase[1]);
    }
  }
  
  // Statistics and insights
  if (lowerQuery.includes('breakdown') || lowerQuery.includes('statistics') || 
      lowerQuery.includes('average') || lowerQuery.includes('top skills')) {
    const stats = getSkillStatistics(resumeDatabase);
    return `📊 Talent Pool Insights:\n\n` +
      `Total Candidates: ${stats.totalCandidates}\n` +
      `Average Experience: ${stats.averageExperience.toFixed(1)} years\n` +
      `Unique Skills: ${stats.totalUniqueSkills}\n\n` +
      `Top 10 Skills:\n` +
      stats.topSkills.slice(0, 10).map((s, i) => `${i + 1}. ${s.skill} (${s.count} candidates)`).join('\n');
  }
  
  // Skill-based search - expanded skill list
  const allSkills = [...new Set(resumeDatabase.flatMap(r => r.skills.map(s => s.toLowerCase())))];
  const requestedSkills = allSkills.filter(skill => lowerQuery.includes(skill));
  
  if (requestedSkills.length > 0 && (lowerQuery.includes('who has') || lowerQuery.includes('with') || 
      lowerQuery.includes('skill') || lowerQuery.includes('know'))) {
    const matches = findCandidatesBySkills(resumeDatabase, requestedSkills);
    if (matches.length > 0) {
      return `Found ${matches.length} candidate(s) with ${requestedSkills.join(' and ')}:\n\n` +
        matches.slice(0, 10).map((r, i) => 
          `${i + 1}. ${r.name} - ${r.matchPercentage.toFixed(0)}% match\n` +
          `   Matched Skills: ${r.matchedSkills.join(', ')}\n` +
          `   Experience: ${r.yearsOfExperience} years\n` +
          `   Email: ${r.email}`
        ).join('\n\n');
    } else {
      return `No candidates found with ${requestedSkills.join(' and ')}. Available skills in database:\n${allSkills.slice(0, 20).join(', ')}`;
    }
  }
  
  // Experience-based search
  if (lowerQuery.includes('year') || lowerQuery.includes('experience')) {
    const yearMatch = lowerQuery.match(/(\d+)\s*(?:\+)?\s*year/);
    if (yearMatch) {
      const requiredYears = parseInt(yearMatch[1]);
      const matches = resumeDatabase.filter(r => r.yearsOfExperience >= requiredYears);
      if (matches.length > 0) {
        return `Found ${matches.length} candidate(s) with ${requiredYears}+ years of experience:\n\n` +
          matches.map((r, i) => 
            `${i + 1}. ${r.name}: ${r.yearsOfExperience} years\n` +
            `   Skills: ${r.skills.slice(0, 5).join(', ')}\n` +
            `   Email: ${r.email}`
          ).join('\n\n');
      } else {
        return `No candidates found with ${requiredYears}+ years of experience. Average experience in pool: ${(resumeDatabase.reduce((sum, r) => sum + r.yearsOfExperience, 0) / resumeDatabase.length).toFixed(1)} years`;
      }
    }
  }
  
  // Job description match
  if (lowerQuery.includes('match') && lowerQuery.includes('jd')) {
    return `To match candidates with a job description, please use the "JD Match" feature in the navigation menu. You can paste the job description there and get AI-powered fit scores for all candidates.`;
  }
  
  // If we have candidates, show their names in suggestions
  if (resumeDatabase.length > 0) {
    const candidateNames = resumeDatabase.slice(0, 3).map(r => r.name).join(', ');
    return `I found ${resumeDatabase.length} candidates in the database${resumeDatabase.length <= 3 ? `: ${candidateNames}` : ` including ${candidateNames}`}.\n\n` +
      `Try asking:\n` +
      `- "List all candidates"\n` +
      `- "Compare the top 2 candidates"\n` +
      `- "Who has Python and Machine Learning skills?"\n` +
      `- "Show me candidates with 5+ years experience"\n` +
      `- "Give me a breakdown of top skills"`;
  }
  
  return `No candidates found in the database. Please upload some resumes first.`;
}

module.exports = { handleQuery };
