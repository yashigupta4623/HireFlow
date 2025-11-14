import { useState } from 'react'
import Landing from './components/Landing'
import ResumeUpload from './components/ResumeUpload'
import ChatInterface from './components/ChatInterface'
import VoiceChat from './components/VoiceChat'
import JobDescription from './components/JobDescription'
import Analytics from './components/Analytics'
import Ranking from './components/Ranking'
import Integration from './components/Integration'
import Outreach from './components/Outreach'
import CandidateInsights from './components/CandidateInsights'
import LiveInterview from './components/LiveInterview'
import './App.css'

function App() {
  const [resumeCount, setResumeCount] = useState(0)
  const [activeTab, setActiveTab] = useState('landing')
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
    setActiveTab('landing')
  }

  if (!isSignedIn) {
    return (
      <div className="app">
        <div className="signin-container">
          <div className="signin-box">
            <div className="signin-logo">
              <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#1a1a1a" stroke="#333333" strokeWidth="1"/>
                <path d="M20 12 L20 28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M14 18 L20 12 L26 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="20" cy="25" r="2" fill="#ffffff"/>
              </svg>
            </div>
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
          <div className="logo-section">
            <div className="logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#1a1a1a" stroke="#333333" strokeWidth="1"/>
                <path d="M20 12 L20 28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M14 18 L20 12 L26 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="20" cy="25" r="2" fill="#ffffff"/>
              </svg>
              <div className="logo-text">
                <h1>TalentVoice</h1>
                <span>AI Recruitment Platform</span>
              </div>
            </div>
          </div>
          
          <nav className="main-nav">
            <div className="nav-item">
              <span onClick={() => setActiveTab('landing')}>Home</span>
            </div>
            
            <div className="nav-item">
              <span>Features</span>
              <div className="dropdown">
                <a onClick={() => setActiveTab('upload')}>Upload Center</a>
                <a onClick={() => setActiveTab('ranking')}>Candidate Ranking</a>
                <a onClick={() => setActiveTab('insights')}>AI Insights</a>
                <a onClick={() => setActiveTab('interview')}>Live Interview</a>
              </div>
            </div>
            
            <div className="nav-item">
              <span>Communication</span>
              <div className="dropdown">
                <a onClick={() => setActiveTab('chat')}>AI Chat</a>
                <a onClick={() => setActiveTab('voice')}>Voice Chat</a>
                <a onClick={() => setActiveTab('outreach')}>Email Outreach</a>
              </div>
            </div>
            
            <div className="nav-item">
              <span>Analytics</span>
              <div className="dropdown">
                <a onClick={() => setActiveTab('analytics')}>Dashboard</a>
                <a onClick={() => setActiveTab('integration')}>Integrations</a>
              </div>
            </div>
          </nav>

          <div className="user-section">
            <span className="username">👤 {username}</span>
            <button onClick={handleSignOut} className="signout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="content">
        {activeTab === 'landing' && (
          <Landing onGetStarted={() => setActiveTab('upload')} />
        )}
        {activeTab === 'upload' && (
          <ResumeUpload onUploadSuccess={() => setResumeCount(prev => prev + 1)} />
        )}
        {activeTab === 'ranking' && (
          <Ranking />
        )}
        {activeTab === 'chat' && (
          <ChatInterface resumeCount={resumeCount} />
        )}
        {activeTab === 'voice' && (
          <VoiceChat />
        )}
        {activeTab === 'interview' && (
          <LiveInterview />
        )}
        {activeTab === 'analytics' && (
          <Analytics />
        )}
        {activeTab === 'insights' && (
          <CandidateInsights />
        )}
        {activeTab === 'outreach' && (
          <Outreach />
        )}
        {activeTab === 'integration' && (
          <Integration />
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#1a1a1a" stroke="#333333" strokeWidth="1"/>
                <path d="M20 12 L20 28" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M14 18 L20 12 L26 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="20" cy="25" r="2" fill="#ffffff"/>
              </svg>
              <h3>TalentVoice</h3>
            </div>
            <p className="footer-desc">AI-powered recruitment platform revolutionizing the hiring process with intelligent automation and real-time insights.</p>
            <div className="footer-stats">
              <span>📊 {resumeCount} {resumeCount === 1 ? 'Resume' : 'Resumes'} in Database</span>
            </div>
          </div>

          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a onClick={() => setActiveTab('upload')}>Upload Center</a></li>
              <li><a onClick={() => setActiveTab('ranking')}>Candidate Ranking</a></li>
              <li><a onClick={() => setActiveTab('insights')}>AI Insights</a></li>
              <li><a onClick={() => setActiveTab('interview')}>Live Interview</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Communication</h4>
            <ul>
              <li><a onClick={() => setActiveTab('chat')}>AI Chat</a></li>
              <li><a onClick={() => setActiveTab('voice')}>Voice Chat</a></li>
              <li><a onClick={() => setActiveTab('outreach')}>Email Outreach</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Analytics & Tools</h4>
            <ul>
              <li><a onClick={() => setActiveTab('analytics')}>Dashboard</a></li>
              <li><a onClick={() => setActiveTab('integration')}>Integrations</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 TalentVoice. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
