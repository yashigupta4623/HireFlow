import './Landing.css'

function Landing({ onGetStarted }) {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">TalentVoice</span>
          </h1>
          <p className="hero-subtitle">
            AI-Powered Conversational Recruiter with Voice Intelligence
          </p>
          <p className="hero-description">
            Transform your hiring process with intelligent automation. 
            Upload resumes, chat with AI, and find the perfect candidates in minutes.
          </p>
          <button onClick={onGetStarted} className="cta-button">
            Get Started →
          </button>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Upload Resumes</h4>
            <p>Drop PDF, DOCX, or TXT files</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>AI Analysis</h4>
            <p>Automatic parsing and insights</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Find Talent</h4>
            <p>Chat, rank, and interview</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
