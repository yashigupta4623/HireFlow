import { useState } from 'react'
import axios from 'axios'

function ResumeUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

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

  return (
    <div className="upload-container">
      <h2>Upload Candidate Resumes</h2>
      <p>Supported formats: PDF, DOCX, TXT</p>
      
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

      {message && <div className="message">{message}</div>}
    </div>
  )
}

export default ResumeUpload
