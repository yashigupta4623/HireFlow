import { useState, useEffect } from 'react'
import axios from 'axios'

function Ranking() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('experience') // 'experience' or 'internships'

  const fetchAndRankCandidates = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/rank-candidates?sortBy=${sortBy}`)
      setCandidates(response.data.candidates)
    } catch (error) {
      console.error('Ranking error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAndRankCandidates()
  }, [sortBy])

  return (
    <div className="ranking-container">
      <h2>🏆 Candidate Rankings</h2>
      <p>Rank candidates based on experience and internships</p>

      <div className="ranking-controls">
        <label>Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="ranking-select"
        >
          <option value="experience">Years of Experience</option>
          <option value="internships">Number of Internships</option>
          <option value="combined">Combined Score</option>
          <option value="activity">Profile Activity</option>
        </select>
        <button onClick={fetchAndRankCandidates} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="no-data">No candidates found. Upload some resumes first!</div>
      ) : (
        <div className="ranking-list">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="ranking-card">
              <div className="rank-badge">#{index + 1}</div>
              <div className="candidate-info">
                <h3>{candidate.name}</h3>
                <div className="candidate-tags">
                  <span className="tag experience-tag">
                    💼 {candidate.yearsOfExperience || 0} years exp
                  </span>
                  <span className="tag internship-tag">
                    🎓 {candidate.internships || 0} internships
                  </span>
                  {candidate.combinedScore && (
                    <span className="tag score-tag">
                      ⭐ Score: {candidate.combinedScore.toFixed(1)}
                    </span>
                  )}
                  {candidate.activityBoost > 0 && (
                    <span className="tag activity-tag">
                      🔥 +{candidate.activityBoost.toFixed(1)} activity boost
                    </span>
                  )}
                </div>
                {candidate.profileLinks && Object.values(candidate.profileLinks).some(link => link) && (
                  <div className="profile-links">
                    {candidate.profileLinks.github && (
                      <a href={candidate.profileLinks.github} target="_blank" rel="noopener noreferrer" className="profile-link">
                        🐙 GitHub
                      </a>
                    )}
                    {candidate.profileLinks.linkedin && (
                      <a href={candidate.profileLinks.linkedin} target="_blank" rel="noopener noreferrer" className="profile-link">
                        💼 LinkedIn
                      </a>
                    )}
                    {candidate.profileLinks.leetcode && (
                      <a href={candidate.profileLinks.leetcode} target="_blank" rel="noopener noreferrer" className="profile-link">
                        💻 LeetCode
                      </a>
                    )}
                  </div>
                )}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="skills-preview">
                    <strong>Skills:</strong> {candidate.skills.slice(0, 5).join(', ')}
                    {candidate.skills.length > 5 && ` +${candidate.skills.length - 5} more`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Ranking
