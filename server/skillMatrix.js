function generateSkillMatrix(candidates) {
  // Extract all unique skills
  const allSkills = new Set();
  candidates.forEach(candidate => {
    candidate.skills.forEach(skill => allSkills.add(skill));
  });
  
  const skillsList = Array.from(allSkills).sort();
  
  // Build matrix
  const matrix = candidates.map(candidate => {
    const row = {
      name: candidate.name,
      id: candidate.id,
      skills: {}
    };
    
    skillsList.forEach(skill => {
      row.skills[skill] = candidate.skills.includes(skill);
    });
    
    return row;
  });
  
  return {
    candidates: matrix,
    skills: skillsList
  };
}

function findCandidatesBySkills(candidates, requiredSkills) {
  const skillsLower = requiredSkills.map(s => s.toLowerCase());
  
  const matches = candidates.map(candidate => {
    const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
    const matchedSkills = skillsLower.filter(skill => 
      candidateSkillsLower.some(cs => cs.includes(skill) || skill.includes(cs))
    );
    
    return {
      ...candidate,
      matchedSkills,
      matchCount: matchedSkills.length,
      matchPercentage: (matchedSkills.length / skillsLower.length) * 100
    };
  }).filter(c => c.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);
  
  return matches;
}

function getSkillStatistics(candidates) {
  const skillFrequency = {};
  
  candidates.forEach(candidate => {
    candidate.skills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
  });
  
  const sortedSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count]) => ({ skill, count }));
  
  const avgExperience = candidates.reduce((sum, c) => sum + c.yearsOfExperience, 0) / candidates.length;
  
  return {
    topSkills: sortedSkills.slice(0, 10),
    totalCandidates: candidates.length,
    averageExperience: Math.round(avgExperience * 10) / 10,
    totalUniqueSkills: Object.keys(skillFrequency).length
  };
}

module.exports = { generateSkillMatrix, findCandidatesBySkills, getSkillStatistics };
