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

      setJdMessage(`✅ Job description saved! Found ${response.data.topCandidates?.length || 0} matching candidates.\n\n`)

      // Sort candidates by fitScore in descending order
      const sortedCandidates = (response.data.topCandidates || []).sort((a, b) => b.fitScore - a.fitScore)
      setTopCandidates(sortedCandidates)
      
      const candidateNames = sortedCandidates.map(candidate => candidate.name) || []
      setCandidateNames(candidateNames)
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
                    <div key={index} className="candidate-item">
                      <span className="candidate-rank">#{index + 1}</span>
                      <span className="candidate-name">{candidate.name}</span>
                      <span className={`match-tag ${colorClass}`}>
                        {score}% JD Match
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ResumeUpload
