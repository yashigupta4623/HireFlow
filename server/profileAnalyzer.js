const axios = require('axios');

// Extract profile links from resume text
function extractProfileLinks(resumeText) {
  const links = {
    github: null,
    linkedin: null,
    leetcode: null,
    hackerrank: null,
    codechef: null,
    codeforces: null,
    portfolio: null,
    other: []
  };

  // Regex patterns for different platforms
  const patterns = {
    github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/gi,
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/gi,
    leetcode: /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/([a-zA-Z0-9_-]+)/gi,
    hackerrank: /(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/([a-zA-Z0-9_-]+)/gi,
    codechef: /(?:https?:\/\/)?(?:www\.)?codechef\.com\/users\/([a-zA-Z0-9_-]+)/gi,
    codeforces: /(?:https?:\/\/)?(?:www\.)?codeforces\.com\/profile\/([a-zA-Z0-9_-]+)/gi
  };

  // Extract links
  for (const [platform, pattern] of Object.entries(patterns)) {
    const match = pattern.exec(resumeText);
    if (match) {
      links[platform] = match[0];
    }
  }

  return links;
}

// Check GitHub activity
async function checkGitHubActivity(githubUrl) {
  try {
    const username = githubUrl.split('/').pop();
    const response = await axios.get(`https://api.github.com/users/${username}/events`, {
      headers: {
        'User-Agent': 'TalentVoice-Recruiter'
      },
      timeout: 5000
    });

    const events = response.data;
    
    // Check activity in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.created_at);
      return eventDate >= thirtyDaysAgo;
    });

    // Get user info
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        'User-Agent': 'TalentVoice-Recruiter'
      },
      timeout: 5000
    });

    const userData = userResponse.data;

    return {
      active: recentEvents.length > 0,
      activityCount: recentEvents.length,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      lastActivity: events.length > 0 ? events[0].created_at : null,
      activityScore: calculateGitHubScore(recentEvents.length, userData.public_repos, userData.followers)
    };
  } catch (error) {
    console.error('GitHub check error:', error.message);
    return { active: false, activityScore: 0, error: error.message };
  }
}

// Check LinkedIn profile (basic check - full API requires OAuth)
async function checkLinkedInProfile(linkedinUrl) {
  try {
    // Basic check if profile is accessible
    const response = await axios.head(linkedinUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    return {
      active: response.status === 200,
      accessible: true,
      activityScore: 5 // Base score for having LinkedIn
    };
  } catch (error) {
    return { active: false, accessible: false, activityScore: 0 };
  }
}

// Check LeetCode profile
async function checkLeetCodeProfile(leetcodeUrl) {
  try {
    const username = leetcodeUrl.split('/').pop();
    
    // LeetCode GraphQL API (public data)
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
          }
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username }
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data.data.matchedUser;
    const totalSolved = data.submitStats.acSubmissionNum.reduce((sum, item) => sum + item.count, 0);

    return {
      active: totalSolved > 0,
      totalSolved,
      ranking: data.profile.ranking,
      activityScore: calculateLeetCodeScore(totalSolved, data.profile.ranking)
    };
  } catch (error) {
    console.error('LeetCode check error:', error.message);
    return { active: false, activityScore: 0 };
  }
}

// Calculate GitHub activity score
function calculateGitHubScore(recentEvents, repos, followers) {
  let score = 0;
  
  // Recent activity (0-20 points)
  score += Math.min(recentEvents * 2, 20);
  
  // Public repos (0-15 points)
  score += Math.min(repos, 15);
  
  // Followers (0-10 points)
  score += Math.min(followers / 10, 10);
  
  return Math.min(score, 45); // Max 45 points from GitHub
}

// Calculate LeetCode score
function calculateLeetCodeScore(totalSolved, ranking) {
  let score = 0;
  
  // Problems solved (0-25 points)
  score += Math.min(totalSolved / 10, 25);
  
  // Ranking (0-20 points)
  if (ranking && ranking < 100000) {
    score += 20;
  } else if (ranking && ranking < 500000) {
    score += 10;
  }
  
  return Math.min(score, 45); // Max 45 points from LeetCode
}

// Analyze all profiles for a candidate
async function analyzeProfiles(resumeText, jobRequirements = {}) {
  const links = extractProfileLinks(resumeText);
  const analysis = {
    links,
    activityScores: {},
    totalActivityScore: 0,
    isActive: false,
    details: {}
  };

  // Check GitHub if present
  if (links.github) {
    const githubData = await checkGitHubActivity(links.github);
    analysis.activityScores.github = githubData.activityScore;
    analysis.details.github = githubData;
    
    if (githubData.active) {
      analysis.isActive = true;
    }
  }

  // Check LinkedIn if present
  if (links.linkedin) {
    const linkedinData = await checkLinkedInProfile(links.linkedin);
    analysis.activityScores.linkedin = linkedinData.activityScore;
    analysis.details.linkedin = linkedinData;
  }

  // Check LeetCode if present (relevant for coding roles)
  if (links.leetcode && jobRequirements.requiresCoding) {
    const leetcodeData = await checkLeetCodeProfile(links.leetcode);
    analysis.activityScores.leetcode = leetcodeData.activityScore;
    analysis.details.leetcode = leetcodeData;
    
    if (leetcodeData.active) {
      analysis.isActive = true;
    }
  }

  // Calculate total activity score
  analysis.totalActivityScore = Object.values(analysis.activityScores).reduce((sum, score) => sum + score, 0);

  return analysis;
}

// Boost candidate ranking based on profile activity
function boostRankingWithActivity(baseScore, activityAnalysis) {
  // Activity can boost score by up to 20%
  const activityBoost = (activityAnalysis.totalActivityScore / 100) * 20;
  const boostedScore = baseScore + activityBoost;
  
  return {
    originalScore: baseScore,
    activityBoost,
    finalScore: Math.min(boostedScore, 100), // Cap at 100
    isActive: activityAnalysis.isActive
  };
}

module.exports = {
  extractProfileLinks,
  analyzeProfiles,
  boostRankingWithActivity,
  checkGitHubActivity,
  checkLinkedInProfile,
  checkLeetCodeProfile
};
