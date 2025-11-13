import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import ChatInterface from './components/ChatInterface'
import VoiceChat from './components/VoiceChat'
import JobDescription from './components/JobDescription'
import Analytics from './components/Analytics'
import './App.css'

function App() {
  const [resumeCount, setResumeCount] = useState(0)
  const [activeTab, setActiveTab] = useState('upload')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = (e) => {
    e.preventDefault()
    if (email.trim() && password.trim()) {
      // Extract name from email (part before @)
      const name = email.split('@')[0]
      setUsername(name)
      setIsSignedIn(true)
    }
  }

  const handleSignOut = () => {
    setIsSignedIn(false)
    setUsername('')
    setEmail('')
    setPassword('')
    setActiveTab('upload')
  }

  if (!isSignedIn) {
    return (
      <div className="app">
        <div className="signin-container">
          <div className="signin-box">
            <h1>TalentVoice</h1>
            <p>AI-Powered Conversational Recruiter with Agora</p>
            <form onSubmit={handleSignIn} className="signin-form">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input"
                required
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signin-input"
                required
              />
              <button type="submit" className="signin-btn">
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>TalentVoice</h1>
            <p>AI-Powered Conversational Recruiter with Agora</p>
          </div>
          <div className="user-section">
            <span className="username">👤 {username}</span>
            <button onClick={handleSignOut} className="signout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload
        </button>
        <button 
          className={activeTab === 'jd' ? 'active' : ''} 
          onClick={() => setActiveTab('jd')}
        >
          🎯 JD Match
        </button>
        <button 
          className={activeTab === 'chat' ? 'active' : ''} 
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={activeTab === 'voice' ? 'active' : ''} 
          onClick={() => setActiveTab('voice')}
        >
          🎤 Voice
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <div className="content">
        {activeTab === 'upload' && (
          <ResumeUpload onUploadSuccess={() => setResumeCount(prev => prev + 1)} />
        )}
        {activeTab === 'jd' && (
          <JobDescription onEvaluationComplete={() => {}} />
        )}
        {activeTab === 'chat' && (
          <ChatInterface resumeCount={resumeCount} />
        )}
        {activeTab === 'voice' && (
          <VoiceChat />
        )}
        {activeTab === 'analytics' && (
          <Analytics />
        )}
      </div>

      <footer className="footer">
        <p>📊 {resumeCount} {resumeCount === 1 ? 'Resume' : 'Resumes'} in Database</p>
      </footer>
    </div>
  )
}

export default App
