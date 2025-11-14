import { useState, useEffect } from 'react'
import axios from 'axios'

function CandidateInsights() {
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/resumes')
      setCandidates(response.data.resumes)
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCandidate = async (candidateId) => {
    setAnalyzing(true)
    setSelectedCandidate(candidateId)
    try {
      const response = await axios.post('/api/candidate-insights', {
        candidateId
      })
      setInsights(response.data.insights)
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
      alert('Failed to analyze candidate: ' + errorMsg)
      setInsights(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="insights-container">
      <h2>🧠 AI-Powered Candidate Insights</h2>
      <p>Deep psychological profiling and culture fit analysis</p>

      <div className="insights-layout">
        <div className="candidates-sidebar">
          <h3>Select Candidate</h3>
          {loading ? (
            <div className="loading">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="no-data">No candidates found</div>
          ) : (
            <div className="candidate-list">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`candidate-item ${selectedCandidate === candidate.id ? 'active' : ''}`}
                  onClick={() => analyzeCandidate(candidate.id)}
                >
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-meta">
                    {candidate.yearsOfExperience || 0} years exp
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="insights-panel">
          {analyzing ? (
            <div className="analyzing">
              <div className="spinner"></div>
              <p>Analyzing candidate profile with AI...</p>
              <small>This may take a few seconds</small>
            </div>
          ) : insights ? (
            <div className="insights-content">
              <div className="insights-header">
                <h3>{insights.candidateName}</h3>
                <span className="analysis-badge">AI Analysis Complete</span>
              </div>

              <div className="profile-summary">
                <h4>📋 Profile Summary</h4>
                <p>{insights.summary}</p>
              </div>

              <div className="scores-grid">
                <div className="score-card">
                  <div className="score-label">Culture Fit</div>
                  <div 
                    className="score-value" 
                    style={{ color: getScoreColor(insights.cultureFit) }}
                  >
                    {insights.cultureFit}/10
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ 
                        width: `${insights.cultureFit * 10}%`,
                        backgroundColor: getScoreColor(insights.cultureFit)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="score-card">
                  <div className="score-label">Technical Strength</div>
                  <div 
                    className="score-value"
                    style={{ color: getScoreColor(insights.technicalStrength) }}
                  >
                    {insights.technicalStrength}/10
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${insights.technicalStrength * 10}%`,
                        backgroundColor: getScoreColor(insights.technicalStrength)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="score-card">
                  <div className="score-label">Leadership Potential</div>
                  <div 
                    className="score-value"
                    style={{ color: getScoreColor(insights.leadershipPotential) }}
                  >
                    {insights.leadershipPotential}/10
                  </div>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ 
                        width: `${insights.leadershipPotential * 10}%`,
                        backgroundColor: getScoreColor(insights.leadershipPotential)
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="insights-section">
                <h4>💪 Key Strengths</h4>
                <ul className="insights-list strengths-list">
                  {insights.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="insights-section">
                <h4>⚠️ Areas for Development</h4>
                <ul className="insights-list weaknesses-list">
                  {insights.weaknesses.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>

              <div className="insights-section">
                <h4>💬 Communication Style</h4>
                <p className="communication-style">{insights.communicationStyle}</p>
              </div>

              <div className="insights-section">
                <h4>🚀 Career Trajectory</h4>
                <p className="career-trajectory">{insights.careerTrajectory}</p>
              </div>

              {insights.concerns && insights.concerns.length > 0 && (
                <div className="insights-section concerns">
                  <h4>🚩 Potential Concerns</h4>
                  <ul className="insights-list concerns-list">
                    {insights.concerns.map((concern, idx) => (
                      <li key={idx}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.uniqueQualities && insights.uniqueQualities.length > 0 && (
                <div className="insights-section unique">
                  <h4>✨ Unique Qualities</h4>
                  <ul className="insights-list unique-list">
                    {insights.uniqueQualities.map((quality, idx) => (
                      <li key={idx}>{quality}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="insights-footer">
                <small>Analysis generated on {new Date(insights.analyzedAt).toLocaleString()}</small>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="empty-state">
                <div className="empty-icon">🧠</div>
                <h3>Select a candidate to analyze</h3>
                <p>Get deep psychological insights, culture fit scores, and career trajectory analysis powered by AI</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidateInsights
