import { useState } from 'react'
import axios from 'axios'

function ResumeUpload({ onUploadSuccess }) {
  const [section, setSection] = useState('resume') // 'resume' or 'jd'

  // Resume states
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'link'
  const [resumeLink, setResumeLink] = useState('')

  // JD states
  const [jd, setJd] = useState('')
  const [jdInputMode, setJdInputMode] = useState('text') // 'text' or 'link'
  const [jdLink, setJdLink] = useState('')
  const [jdLoading, setJdLoading] = useState(false)
  const [jdMessage, setJdMessage] = useState('')

  const [candidateNames, setCandidateNames] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  
  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    setUploading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setMessage(`✅ ${response.data.candidateName} uploaded successfully!`)
      setFile(null)
      onUploadSuccess()
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleLinkUpload = async () => {
    if (!resumeLink.trim()) {
      setMessage('Please enter a resume link')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/upload-link', {
        link: resumeLink
      })

      setMessage(`✅ ${response.data.candidateName} uploaded successfully!`)
      setResumeLink('')
      onUploadSuccess()
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleJDSubmit = async () => {
    if (!jd.trim()) {
      setJdMessage('Please enter a job description')
      return
    }

    setJdLoading(true)
    setJdMessage('')

    try {
      const response = await axios.post('/api/job-description', {
        jobDescription: jd
      })

      console.log('=== Received candidates from API ===');
      console.log('Full response:', response.data);
      
      // Sort candidates by fitScore in descending order
      const sortedCandidates = (response.data.topCandidates || []).sort((a, b) => b.fitScore - a.fitScore)
      
      // Log each candidate's email
      sortedCandidates.forEach((c, idx) => {
        console.log(`${idx + 1}. ${c.name}: email=${c.email || 'MISSING'}`);
      });
      
      setTopCandidates(sortedCandidates)
      
      const candidateNames = sortedCandidates.map(candidate => candidate.name) || []
      setCandidateNames(candidateNames)
      
      setJdMessage(`✅ Job description saved! Found ${response.data.topCandidates?.length || 0} matching candidates.\n\n`)
    } catch (error) {
      setJdMessage(`❌ Failed to save: ${error.message}`)
    } finally {
      setJdLoading(false)
    }
  }

  const handleJDLinkSubmit = async () => {
    if (!jdLink.trim()) {
      setJdMessage('Please enter a job description URL')
      return
    }

    setJdLoading(true)
    setJdMessage('')

    try {
      const response = await axios.post('/api/job-description-link', {
        link: jdLink
      })

      setJd(response.data.jobDescription)
      setJdMessage(`✅ Job description fetched and saved! Found ${response.data.topCandidates?.length || 0} matching candidates.`)
      
      // Sort candidates by fitScore in descending order
      const sortedCandidates = (response.data.topCandidates || []).sort((a, b) => b.fitScore - a.fitScore)
      setTopCandidates(sortedCandidates)
    } catch (error) {
      setJdMessage(`❌ Failed to fetch: ${error.message}`)
    } finally {
      setJdLoading(false)
    }
  }

  const openCandidateModal = (candidate) => {
    console.log('Opening modal for candidate:', candidate);
    console.log('Candidate email:', candidate.email);
    console.log('Full candidate object:', JSON.stringify(candidate, null, 2));
    setSelectedCandidate(candidate);
    setShowModal(true);
  }

  const closeCandidateModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  }

  const handleContactCandidate = () => {
    setShowEmailConfirm(true);
  }

  const handleSendEmail = async () => {
    if (!selectedCandidate.email) {
      alert('No email address available for this candidate');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await axios.post('/api/send-candidate-email', {
        candidateName: selectedCandidate.name,
        candidateEmail: selectedCandidate.email,
        jobDescription: jd,
        fitScore: selectedCandidate.fitScore
      });

      if (response.data.success) {
        alert('✅ Email sent successfully!');
        setShowEmailConfirm(false);
      }
    } catch (error) {
      alert('❌ Failed to send email: ' + error.message);
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="upload-container">
      <h2>📤 Upload Center</h2>
      <p>Upload resumes and job descriptions in one place</p>

      <div className="section-tabs">
        <button
          className={section === 'resume' ? 'active' : ''}
          onClick={() => setSection('resume')}
        >
          👤 Resumes
        </button>
        <button
          className={section === 'jd' ? 'active' : ''}
          onClick={() => setSection('jd')}
        >
          📋 Job Description
        </button>
      </div>

      {section === 'resume' ? (
        <>
          <h3>Upload Candidate Resumes</h3>
          <p className="section-desc">Supported formats: PDF, DOCX, TXT</p>

          <div className="upload-mode-tabs">
            <button
              className={uploadMode === 'file' ? 'active' : ''}
              onClick={() => setUploadMode('file')}
            >
              📁 Upload File
            </button>
            <button
              className={uploadMode === 'link' ? 'active' : ''}
              onClick={() => setUploadMode('link')}
            >
              🔗 Upload Link
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div className="upload-box">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                disabled={uploading}
              />

              {file && <p className="file-name">Selected: {file.name}</p>}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          ) : (
            <div className="upload-box">
              <input
                type="url"
                placeholder="Enter resume URL (e.g., Google Drive, Dropbox link)"
                value={resumeLink}
                onChange={(e) => setResumeLink(e.target.value)}
                disabled={uploading}
                className="link-input"
              />

              <button
                onClick={handleLinkUpload}
                disabled={!resumeLink.trim() || uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : 'Upload from Link'}
              </button>
            </div>
          )}

          {message && <div className="message">{message}</div>}
        </>
      ) : (
        <>
          <h3>Upload Job Description</h3>
          <p className="section-desc">Add JD to match candidates automatically</p>

          <div className="upload-mode-tabs">
            <button
              className={jdInputMode === 'text' ? 'active' : ''}
              onClick={() => setJdInputMode('text')}
            >
              📝 Paste Text
            </button>
            <button
              className={jdInputMode === 'link' ? 'active' : ''}
              onClick={() => setJdInputMode('link')}
            >
              🔗 Upload Link
            </button>
          </div>

          {jdInputMode === 'text' ? (
            <div className="jd-input-section">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste job description here..."
                className="jd-textarea"
                rows={10}
              />

              <button
                onClick={handleJDSubmit}
                disabled={!jd.trim() || jdLoading}
                className="upload-btn"
              >
                {jdLoading ? '⏳ Saving...' : '💾 Save Job Description'}
              </button>
            </div>
          ) : (
            <div className="jd-input-section">
              <input
                type="url"
                value={jdLink}
                onChange={(e) => setJdLink(e.target.value)}
                placeholder="Enter job description URL"
                className="link-input"
                disabled={jdLoading}
              />

              <button
                onClick={handleJDLinkSubmit}
                disabled={!jdLink.trim() || jdLoading}
                className="upload-btn"
              >
                {jdLoading ? '⏳ Fetching...' : '🔍 Fetch & Save JD'}
              </button>
            </div>
          )}

          {jdMessage && <div className="message">{jdMessage}</div>}
          
          {topCandidates.length > 0 && (
            <div className='matched-candidates'>
              <h3>📊 Matched Candidates (Sorted by JD Match)</h3>
              <div className="candidates-list">
                {topCandidates.map((candidate, index) => {
                  const score = candidate.fitScore || 0;
                  // Determine color class based on new score ranges
                  let colorClass = 'match-black';
                  if (score >= 85) colorClass = 'match-dark-green';
                  else if (score >= 71) colorClass = 'match-yellow';
                  else if (score >= 60) colorClass = 'match-blue';
                  else if (score >= 49) colorClass = 'match-orange';
                  else if (score >= 40) colorClass = 'match-red';
                  
                  return (
                    <div 
                      key={index} 
                      className="candidate-item clickable"
                      onClick={() => openCandidateModal(candidate)}
                    >
                      <span className="candidate-rank">#{index + 1}</span>
                      <span className="candidate-name">{candidate.name}</span>
                      <span className={`match-tag ${colorClass}`}>
                        {score}% JD Match
                      </span>
                      <span className="view-details">👁️ View Details</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Candidate Details Modal */}
      {showModal && selectedCandidate && (
        <div className="modal-overlay" onClick={closeCandidateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCandidateModal}>✕</button>
            
            <div className="modal-header">
              <h2>👤 {selectedCandidate.name}</h2>
              <div className={`modal-score ${
                selectedCandidate.fitScore >= 85 ? 'score-excellent' :
                selectedCandidate.fitScore >= 71 ? 'score-good' :
                selectedCandidate.fitScore >= 60 ? 'score-fair' :
                selectedCandidate.fitScore >= 49 ? 'score-moderate' :
                selectedCandidate.fitScore >= 40 ? 'score-low' : 'score-poor'
              }`}>
                {selectedCandidate.fitScore}% Match
              </div>
            </div>

            <div className="modal-body">
              {/* Basic Info */}
              <div className="modal-section">
                <h3>📋 Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Experience:</span>
                    <span className="info-value">{selectedCandidate.yearsOfExperience || 0} years</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Education:</span>
                    <span className="info-value">{selectedCandidate.education || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Skills:</span>
                    <span className="info-value">{selectedCandidate.skills?.length || 0} skills</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {(selectedCandidate.email || selectedCandidate.phone || selectedCandidate.location) && (
                <div className="modal-section">
                  <h3>📞 Contact Information</h3>
                  <div className="info-grid">
                    {selectedCandidate.email && (
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedCandidate.email}</span>
                      </div>
                    )}
                    {selectedCandidate.phone && (
                      <div className="info-item">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedCandidate.phone}</span>
                      </div>
                    )}
                    {selectedCandidate.location && (
                      <div className="info-item">
                        <span className="info-label">Location:</span>
                        <span className="info-value">{selectedCandidate.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Why Suitable */}
              <div className="modal-section">
                <h3>💡 Why {selectedCandidate.fitScore}% Suitable?</h3>
                <p className="explanation-text">
                  {selectedCandidate.fitExplanation || 'This candidate shows strong alignment with the job requirements.'}
                </p>
              </div>

              {/* Strengths */}
              {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
                <div className="modal-section">
                  <h3>✅ Key Strengths</h3>
                  <div className="strengths-list">
                    {selectedCandidate.strengths.map((strength, idx) => (
                      <span key={idx} className="strength-tag">
                        ✓ {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {selectedCandidate.gaps && selectedCandidate.gaps.length > 0 && (
                <div className="modal-section">
                  <h3>⚠️ Areas for Development</h3>
                  <div className="gaps-list">
                    {selectedCandidate.gaps.map((gap, idx) => (
                      <span key={idx} className="gap-tag">
                        • {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Reasons - Bullet Points */}
              <div className="modal-section">
                <h3>🎯 Why {selectedCandidate.fitScore}% Match?</h3>
                <ul className="match-reasons-list">
                  {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 ? (
                    selectedCandidate.strengths.slice(0, 5).map((strength, idx) => (
                      <li key={idx}>
                        <strong>✓</strong> Proficient in <strong>{strength}</strong> which is required for this role
                      </li>
                    ))
                  ) : (
                    <li>Strong alignment with job requirements based on experience and skills</li>
                  )}
                  {selectedCandidate.yearsOfExperience > 0 && (
                    <li>
                      <strong>✓</strong> Has <strong>{selectedCandidate.yearsOfExperience} years</strong> of relevant experience
                    </li>
                  )}
                  {selectedCandidate.education && (
                    <li>
                      <strong>✓</strong> Educational background: <strong>{selectedCandidate.education}</strong>
                    </li>
                  )}
                  {selectedCandidate.gaps && selectedCandidate.gaps.length > 0 && (
                    <li>
                      <strong>⚠️</strong> Could benefit from development in: {selectedCandidate.gaps.slice(0, 2).join(', ')}
                    </li>
                  )}
                </ul>
              </div>

              {/* Experience Summary */}
              {selectedCandidate.experience && (
                <div className="modal-section">
                  <h3>📝 Experience Summary</h3>
                  <p className="experience-text">
                    {selectedCandidate.experience.substring(0, 500)}
                    {selectedCandidate.experience.length > 500 ? '...' : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeCandidateModal}>
                Close
              </button>
              <button className="btn-primary" onClick={handleContactCandidate}>
                📧 Contact Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {showEmailConfirm && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowEmailConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📧 Send Email to Candidate</h3>
            <p>
              Do you want to send an email to <strong>{selectedCandidate.name}</strong> with the job description?
            </p>
            
            {!selectedCandidate.email && (
              <div className="email-warning">
                ⚠️ No email address found for this candidate. Please add their email to the resume or contact them through other means.
              </div>
            )}
            
            <div className="confirm-details">
              <p><strong>To:</strong> {selectedCandidate.email || <span className="no-email-text">No email available</span>}</p>
              <p><strong>Subject:</strong> Exciting Job Opportunity - {selectedCandidate.fitScore}% Match</p>
            </div>
            <div className="confirm-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowEmailConfirm(false)}
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSendEmail}
                disabled={sendingEmail || !selectedCandidate.email}
              >
                {sendingEmail ? '⏳ Sending...' : '✅ Yes, Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUpload
