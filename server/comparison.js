const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function compareCandidates(candidate1, candidate2, role = '') {
  const prompt = `Compare these candidates briefly (max 80 words):

${candidate1.name}: ${candidate1.yearsOfExperience} years, Key skills: ${candidate1.skills.slice(0, 5).join(', ')}
${candidate2.name}: ${candidate2.yearsOfExperience} years, Key skills: ${candidate2.skills.slice(0, 5).join(', ')}

Focus on: Experience difference, 2-3 key skill differences, who's stronger overall. Be concise and professional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 120
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Comparison error:', error);
    return compareLocally(candidate1, candidate2, role);
  }
}

function compareLocally(candidate1, candidate2, role) {
  const c1 = candidate1;
  const c2 = candidate2;
  
  console.log(`Comparing: ${c1.name} (${c1.yearsOfExperience} years, ${c1.skills.length} skills) vs ${c2.name} (${c2.yearsOfExperience} years, ${c2.skills.length} skills)`);
  
  // Get top 3 unique skills for each
  const c1Skills = new Set(c1.skills.map(s => s.toLowerCase()));
  const c2Skills = new Set(c2.skills.map(s => s.toLowerCase()));
  const uniqueC1 = c1.skills.filter(s => !c2Skills.has(s.toLowerCase())).slice(0, 3);
  const uniqueC2 = c2.skills.filter(s => !c1Skills.has(s.toLowerCase())).slice(0, 3);
  
  // Build concise comparison
  let comparison = `Comparing ${c1.name} with ${c1.yearsOfExperience} years experience versus ${c2.name} with ${c2.yearsOfExperience} years experience. `;
  
  // Experience comparison
  const expDiff = c2.yearsOfExperience - c1.yearsOfExperience;
  if (Math.abs(expDiff) >= 1) {
    const moreExp = expDiff > 0 ? c2.name : c1.name;
    const lessExp = expDiff > 0 ? c1.name : c2.name;
    comparison += `${moreExp} has ${Math.abs(expDiff)} more ${Math.abs(expDiff) === 1 ? 'year' : 'years'} of experience than ${lessExp}. `;
  } else {
    comparison += `Both have equal experience. `;
  }
  
  // Key skill highlights
  const c1TopSkills = c1.skills.slice(0, 3).join(', ');
  const c2TopSkills = c2.skills.slice(0, 3).join(', ');
  
  comparison += `${c1.name}'s top skills include ${c1TopSkills}. `;
  comparison += `${c2.name}'s top skills include ${c2TopSkills}. `;
  
  // Recommendation based on experience and skills
  if (Math.abs(expDiff) >= 2) {
    const stronger = expDiff > 0 ? c2.name : c1.name;
    comparison += `${stronger} appears stronger due to more experience.`;
  } else if (c1.skills.length > c2.skills.length * 1.2) {
    comparison += `${c1.name} has a broader skill set with ${c1.skills.length} skills.`;
  } else if (c2.skills.length > c1.skills.length * 1.2) {
    comparison += `${c2.name} has a broader skill set with ${c2.skills.length} skills.`;
  } else {
    comparison += `Both candidates are strong and comparable.`;
  }
  
  return comparison;
}

module.exports = { compareCandidates };
