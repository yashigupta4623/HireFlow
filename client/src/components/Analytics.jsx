import { useState, useEffect } from 'react'
import axios from 'axios'

function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading analytics...</div>

  if (!stats || stats.totalCandidates === 0) {
    return (
      <div className="analytics-container">
        <h2>📊 Talent Pool Analytics</h2>
        <p className="no-data">No data available. Upload resumes to see insights.</p>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <h2>📊 Talent Pool Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCandidates}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageExperience}</div>
          <div className="stat-label">Avg Experience (years)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUniqueSkills}</div>
          <div className="stat-label">Unique Skills</div>
        </div>
      </div>

      <div className="top-skills">
        <h3>Top 10 Skills in Pool</h3>
        <div className="skills-chart">
          {stats.topSkills.map((skill, idx) => (
            <div key={idx} className="skill-bar">
              <div className="skill-info">
                <span className="skill-name">{skill.skill}</span>
                <span className="skill-count">{skill.count}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${(skill.count / stats.totalCandidates) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={fetchAnalytics} className="refresh-btn">
        🔄 Refresh Analytics
      </button>
    </div>
  )
}

export default Analytics
