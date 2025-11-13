import { useState } from 'react'
import axios from 'axios'

function Outreach() {
  const [jd, setJd] = useState('')
  const [monthsOld, setMonthsOld] = useState(6)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('')
  const [sendingEmails, setSendingEmails] = useState(false)
  const [loadingStoredJD, setLoadingStoredJD] = useState(false)

  const loadStoredJD = async () => {
    setLoadingStoredJD(true)
    try {
      const response = await axios.get('/api/stored-jd')
      if (response.data.jobDescription) {
        setJd(response.data.jobDescription)
      } else {
        alert('No job description found. Please upload one in the JD Match section first.')
      }
    } catch (error) {
      alert('Failed to load stored JD: ' + error.message)
    } finally {
      setLoadingStoredJD(false)
    }
  }

  const searchCandidates = async () => {
    if (!jd.trim()) {
      alert('Please enter a job description')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/outreach/search', {
        jobDescription: jd,
        maxMonthsOld: monthsOld
      })

      setMatches(response.data.matches)
      
      // Auto-generate email template
      setEmailSubject(`Exciting Opportunity: ${response.data.jobTitle || 'New Position'}`)
      setEmailTemplate(response.data.emailTemplate)
    } catch (error) {
      alert('Search failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const selectAll = () => {
    setSelectedCandidates(matches.map(m => m.id))
  }

  const deselectAll = () => {
    setSelectedCandidates([])
  }

  const sendEmails = async () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate')
      return
    }

    if (!emailSubject.trim() || !emailTemplate.trim()) {
      alert('Please fill in email subject and template')
      return
    }

    setSendingEmails(true)
    try {
      const response = await axios.post('/api/outreach/send-emails', {
        candidateIds: selectedCandidates,
        subject: emailSubject,
        template: emailTemplate,
        jobDescription: jd
      })

      alert(`Emails sent successfully to ${response.data.sentCount} candidates!`)
      setSelectedCandidates([])
    } catch (error) {
      alert('Failed to send emails: ' + error.message)
    } finally {
      setSendingEmails(false)
    }
  }

  return (
    <div className="outreach-container">
      <h2>📧 Candidate Outreach</h2>
      <p>Search recent candidates and send availability emails</p>

      <div className="outreach-search">
        <div className="search-controls">
          <div className="form-group">
            <div className="jd-header">
              <label>Job Description</label>
              <button 
                onClick={loadStoredJD} 
                disabled={loadingStoredJD}
                className="load-jd-btn"
              >
                {loadingStoredJD ? '⏳ Loading...' : '📥 Load Uploaded JD'}
              </button>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description here or load from uploaded JD..."
              className="jd-textarea"
              rows={8}
            />
          </div>

          <div className="form-group">
            <label>Search resumes from last</label>
            <select 
              value={monthsOld} 
              onChange={(e) => setMonthsOld(Number(e.target.value))}
              className="months-select"
            >
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>

          <button 
            onClick={searchCandidates} 
            disabled={loading || !jd.trim()}
            className="search-btn"
          >
            {loading ? '🔍 Searching...' : '🔍 Search Candidates'}
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <>
          <div className="matches-section">
            <div className="matches-header">
              <h3>Found {matches.length} Matching Candidates</h3>
              <div className="selection-controls">
                <button onClick={selectAll} className="select-all-btn">
                  ✓ Select All
                </button>
                <button onClick={deselectAll} className="deselect-all-btn">
                  ✗ Deselect All
                </button>
              </div>
            </div>

            <div className="matches-list">
              {matches.map((candidate) => (
                <div 
                  key={candidate.id} 
                  className={`match-card ${selectedCandidates.includes(candidate.id) ? 'selected' : ''}`}
                  onClick={() => toggleCandidate(candidate.id)}
                >
                  <div className="match-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="match-info">
                    <h4>{candidate.name}</h4>
                    <p className="match-email">📧 {candidate.email || 'No email available'}</p>
                    <div className="match-details">
                      <span className="match-score">Match: {candidate.fitScore}%</span>
                      <span className="match-age">Uploaded: {candidate.uploadedAgo}</span>
                    </div>
                    <p className="match-reason">{candidate.matchReason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="email-section">
            <h3>Email Template</h3>
            <p className="selected-count">
              {selectedCandidates.length} candidate(s) selected
            </p>

            <div className="form-group">
              <label>Subject Line</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="email-subject-input"
                placeholder="Email subject"
              />
            </div>

            <div className="form-group">
              <label>Email Body</label>
              <textarea
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                className="email-template-textarea"
                rows={12}
                placeholder="Email template (use {{name}} for candidate name)"
              />
            </div>

            <button 
              onClick={sendEmails}
              disabled={sendingEmails || selectedCandidates.length === 0}
              className="send-emails-btn"
            >
              {sendingEmails ? '📤 Sending...' : `📤 Send Emails to ${selectedCandidates.length} Candidate(s)`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Outreach
