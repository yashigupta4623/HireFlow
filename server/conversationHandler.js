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

  // Use AI for natural conversational responses
  const context = resumeDatabase.map((resume, idx) => 
    `${resume.name}: ${resume.yearsOfExperience} years experience, Skills: ${resume.skills.slice(0, 8).join(', ')}, Email: ${resume.email}`
  ).join('\n');

  const systemPrompt = `You are a helpful HR assistant. Answer questions about these candidates concisely.

Candidates:
${context}

Rules:
- Keep answers under 40 words
- Be direct and specific
- If no match, say "No" clearly
- Use candidate names and actual data
- Sound natural, not robotic`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return localResult;
  }
}

async function handleQueryLocally(query, resumeDatabase) {
  const lowerQuery = query.toLowerCase();
  
  // Greetings
  if (lowerQuery.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
    return `Hi! I have ${resumeDatabase.length} candidates ready. What would you like to know?`;
  }
  
  // Yes/Affirmative responses - compare top candidates
  if (lowerQuery.match(/^(yes|yeah|yep|sure|ok|okay|yesh|ya)/)) {
    if (resumeDatabase.length >= 2) {
      const sorted = [...resumeDatabase].sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
      const c1 = sorted[0];
      const c2 = sorted[1];
      return await compareCandidates(c1, c2);
    }
    return `Sure! What would you like me to do?`;
  }
  
  // Experience-only search (prioritize this before skill search)
  // Match patterns like "2 years", "more than 2 years", "2+ years", "over 2 years"
  const yearMatch = lowerQuery.match(/(?:more than|over|above|at least|minimum|min)?\s*(\d+)\s*(?:\+)?\s*year/i) ||
                    lowerQuery.match(/(\d+)\s*(?:\+)?\s*year/);
  
  if (yearMatch && (lowerQuery.includes('experience') || lowerQuery.includes('year'))) {
    const requiredYears = parseInt(yearMatch[1]);
    const matches = resumeDatabase.filter(r => r.yearsOfExperience >= requiredYears);
    
    if (matches.length > 0) {
      const names = matches.slice(0, 2).map(r => `${r.name} (${r.yearsOfExperience} years)`).join(' and ');
      return `Found ${matches.length} with ${requiredYears}+ years: ${names}.`;
    } else {
      const maxExp = Math.max(...resumeDatabase.map(r => r.yearsOfExperience || 0));
      return `No candidates with ${requiredYears}+ years. Highest is ${maxExp} years.`;
    }
  }
  
  // List all candidates
  if (lowerQuery.includes('list all') || lowerQuery.includes('show all') || lowerQuery.includes('all candidates')) {
    const candidateList = resumeDatabase.map((r, i) => 
      `${i + 1}. ${r.name} - ${r.yearsOfExperience} years`
    ).join(', ');
    return `We have ${resumeDatabase.length} candidates: ${candidateList}. Need details on anyone?`;
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
    const topSkills = stats.topSkills.slice(0, 3).map(s => s.skill).join(', ');
    return `Average experience is ${stats.averageExperience.toFixed(1)} years. Top skills: ${topSkills}. Need specific candidates?`;
  }
  
  // Skill-based search - expanded skill list
  const allSkills = [...new Set(resumeDatabase.flatMap(r => r.skills.map(s => s.toLowerCase())))];
  // Only match skills that are at least 2 characters and are whole words
  const requestedSkills = allSkills.filter(skill => 
    skill.length >= 2 && lowerQuery.includes(skill.toLowerCase())
  );
  
  if (requestedSkills.length > 0 && (lowerQuery.includes('who has') || lowerQuery.includes('with') || 
      lowerQuery.includes('skill') || lowerQuery.includes('know') || lowerQuery.includes('find'))) {
    const matches = findCandidatesBySkills(resumeDatabase, requestedSkills);
    if (matches.length > 0) {
      const topMatches = matches.slice(0, 2).map(r => 
        `${r.name} with ${r.yearsOfExperience} years`
      ).join(' and ');
      return `Found ${matches.length} with ${requestedSkills.join(' and ')}: ${topMatches}. Want to compare them?`;
    } else {
      return `No exact matches for ${requestedSkills.join(' and ')}. Try different skills?`;
    }
  }
  

  
  // Job description match
  if ((lowerQuery.includes('best') || lowerQuery.includes('match') || lowerQuery.includes('fit')) && 
      (lowerQuery.includes('jd') || lowerQuery.includes('job'))) {
    
    if (jobDescription) {
      // If JD is available, use AI to evaluate
      return `Based on the job description, I'll analyze the candidates. However, for detailed fit scores, please use the "JD Match" feature in the navigation menu where you can see percentage matches and detailed analysis for each candidate.`;
    }
    
    return `To find the best candidate for a job description:\n\n` +
      `1. Go to the "Features" menu and select "JD Match"\n` +
      `2. Paste your job description\n` +
      `3. Click "Evaluate Candidates"\n` +
      `4. You'll get AI-powered fit scores (0-100%) for each candidate with detailed explanations\n\n` +
      `This will show you exactly which candidate is the best match!`;
  }
  
  // Default conversational response
  if (resumeDatabase.length > 0) {
    return `I have ${resumeDatabase.length} candidates. Ask me to compare, find skills, or get insights.`;
  }
  
  return `No candidates yet. Upload resumes to get started!`;
}

module.exports = { handleQuery };
