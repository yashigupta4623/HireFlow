const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function compareCandidates(candidate1, candidate2, role = '') {
  const prompt = `Compare these two candidates${role ? ` for ${role} role` : ''}:

Candidate 1: ${candidate1.name}
Skills: ${candidate1.skills.join(', ')}
Experience: ${candidate1.yearsOfExperience} years
Education: ${candidate1.education}

Candidate 2: ${candidate2.name}
Skills: ${candidate2.skills.join(', ')}
Experience: ${candidate2.yearsOfExperience} years
Education: ${candidate2.education}

Provide a concise comparison highlighting:
1. Key differences in skills and experience
2. Who might be better suited and why
3. Unique strengths of each candidate`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 400
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Comparison error:', error);
    return compareLocally(candidate1, candidate2, role);
  }
}

function compareLocally(candidate1, candidate2, role) {
  const c1Skills = new Set(candidate1.skills.map(s => s.toLowerCase()));
  const c2Skills = new Set(candidate2.skills.map(s => s.toLowerCase()));
  
  const uniqueToC1 = candidate1.skills.filter(s => !c2Skills.has(s.toLowerCase()));
  const uniqueToC2 = candidate2.skills.filter(s => !c1Skills.has(s.toLowerCase()));
  const commonSkills = candidate1.skills.filter(s => c2Skills.has(s.toLowerCase()));
  
  let comparison = `Comparison for ${role || 'the position'}:\n\n`;
  comparison += `${candidate1.name} has ${candidate1.yearsOfExperience} years of experience, `;
  comparison += `while ${candidate2.name} has ${candidate2.yearsOfExperience} years.\n\n`;
  
  if (uniqueToC1.length > 0) {
    comparison += `${candidate1.name}'s unique skills: ${uniqueToC1.join(', ')}\n`;
  }
  
  if (uniqueToC2.length > 0) {
    comparison += `${candidate2.name}'s unique skills: ${uniqueToC2.join(', ')}\n`;
  }
  
  if (commonSkills.length > 0) {
    comparison += `\nBoth share: ${commonSkills.join(', ')}\n`;
  }
  
  const expDiff = Math.abs(candidate1.yearsOfExperience - candidate2.yearsOfExperience);
  if (expDiff > 2) {
    const moreExp = candidate1.yearsOfExperience > candidate2.yearsOfExperience ? candidate1.name : candidate2.name;
    comparison += `\n${moreExp} has significantly more experience.`;
  }
  
  return comparison;
}

module.exports = { compareCandidates };
