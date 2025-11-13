const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    text = data.text;
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else {
    text = fs.readFileSync(filePath, 'utf8');
  }

  return extractResumeData(text);
}

function extractResumeData(text) {
  // Extract name
  const nameMatch = text.match(/(?:Name[:\s]+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  const name = nameMatch ? nameMatch[1] : 'Unknown';

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract skills
  const skillsSection = text.match(/(?:Skills|Technical Skills|Core Competencies)[:\s]+([\s\S]*?)(?=\n\n|Experience|Education|$)/i);
  const skills = skillsSection 
    ? skillsSection[1].split(/[,\n•]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 50)
    : extractCommonSkills(text);

  // Extract experience
  const experienceSection = text.match(/(?:Experience|Work Experience|Employment)[:\s]+([\s\S]*?)(?=\n\n|Education|Skills|$)/i);
  const experience = experienceSection ? experienceSection[1].trim() : '';

  // Extract education
  const educationSection = text.match(/(?:Education|Academic)[:\s]+([\s\S]*?)(?=\n\n|Experience|Skills|$)/i);
  const education = educationSection ? educationSection[1].trim() : '';

  // Calculate years of experience
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  const yearsOfExperience = yearMatches ? calculateYearsOfExperience(yearMatches) : 0;

  return {
    name,
    email,
    phone,
    skills,
    experience,
    education,
    yearsOfExperience,
    rawText: text
  };
}

function extractCommonSkills(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
    'Machine Learning', 'AI', 'Data Science', 'Agile', 'Scrum'
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

function calculateYearsOfExperience(years) {
  const numericYears = years.map(y => parseInt(y)).sort();
  if (numericYears.length < 2) return 0;
  return new Date().getFullYear() - Math.min(...numericYears);
}

module.exports = { parseResume };
