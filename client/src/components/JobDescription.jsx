import { useState } from 'react'
import axios from 'axios'

function JobDescription({ onEvaluationComplete }) {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [inputMode, setInputMode] = useState('text') // 'text' or 'link'
  const [jdLink, setJdLink] = useState('')

  const handleEvaluate = async () => {
    if (!jd.trim()) return

    setLoading(true)
    try {
      const response = await axios.post('/api/job-description', { 
        jobDescription: jd 
      })
      
      setResults(response.data.topCandidates)
      onEvaluationComplete(response.data.topCandidates)
    } catch (error) {
      console.error('Evaluation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkEvaluate = async () => {
    if (!jdLink.trim()) return

    setLoading(true)
    try {
      const response = await axios.post('/api/job-description-link', { 
        link: jdLink 
      })
      
      setJd(response.data.jobDescription)
      setResults(response.data.topCandidates)
      onEvaluationComplete(response.data.topCandidates)
    } catch (error) {
      console.error('Evaluation error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="jd-container">
      <h2>📋 Job Description Matching</h2>
      <p>Paste a job description to auto-evaluate all candidates with AI fit scores</p>

      <div className="upload-mode-tabs">
        <button 
          className={inputMode === 'text' ? 'active' : ''}
          onClick={() => setInputMode('text')}
        >
          📝 Paste Text
        </button>
        <button 
          className={inputMode === 'link' ? 'active' : ''}
          onClick={() => setInputMode('link')}
        >
          🔗 Upload Link
        </button>
      </div>

      {inputMode === 'text' ? (
        <>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste job description here..."
            className="jd-textarea"
            rows={10}
          />

          <button 
            onClick={handleEvaluate} 
            disabled={!jd.trim() || loading}
            className="evaluate-btn"
          >
            {loading ? '🔄 Evaluating...' : '🎯 Evaluate Candidates'}
          </button>
        </>
      ) : (
        <>
          <input
            type="url"
            value={jdLink}
            onChange={(e) => setJdLink(e.target.value)}
            placeholder="Enter job description URL"
            className="link-input"
          />

          <button 
            onClick={handleLinkEvaluate} 
            disabled={!jdLink.trim() || loading}
            className="evaluate-btn"
          >
            {loading ? '🔄 Fetching & Evaluating...' : '🎯 Fetch & Evaluate'}
          </button>
        </>
      )}

      {results && results.length > 0 && (
        <div className="results">
          <h3>Top Matches</h3>
          {results.map((candidate, idx) => (
            <div key={idx} className="candidate-card">
              <div className="candidate-header">
                <h4>{candidate.name}</h4>
                <span className={`fit-score score-${Math.floor(candidate.fitScore / 20)}`}>
                  {candidate.fitScore}% Match
                </span>
              </div>
              <p className="explanation">{candidate.explanation}</p>
              {candidate.strengths && candidate.strengths.length > 0 && (
                <div className="strengths">
                  <strong>✅ Strengths:</strong> {candidate.strengths.join(', ')}
                </div>
              )}
              {candidate.gaps && candidate.gaps.length > 0 && (
                <div className="gaps">
                  <strong>⚠️ Gaps:</strong> {candidate.gaps.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobDescription
