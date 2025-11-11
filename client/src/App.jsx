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

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 AI Resume Screener</h1>
        <p>Powered by Agora Conversational AI</p>
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
        <p>Resumes in database: {resumeCount}</p>
      </footer>
    </div>
  )
}

export default App
