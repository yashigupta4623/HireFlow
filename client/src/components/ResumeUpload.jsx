import { useState } from 'react'
import axios from 'axios'

function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'link'
  const [resumeLink, setResumeLink] = useState('')

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

  return (
    <div className="upload-container">
      <h2>Upload Candidate Resumes</h2>
      <p>Supported formats: PDF, DOCX, TXT</p>
      
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
    </div>
  )
}

export default ResumeUpload
