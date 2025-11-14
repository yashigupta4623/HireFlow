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

      <div className="features-grid">
        <div className="feature-card">
          <h3>Voice Interviews</h3>
          <p>Conduct real-time AI-powered voice interviews using Agora technology</p>
        </div>

        <div className="feature-card">
          <h3>Smart Parsing</h3>
          <p>Automatically extract skills, experience, and education from resumes</p>
        </div>

        <div className="feature-card">
          <h3>JD Matching</h3>
          <p>Get AI-powered fit scores to match candidates with job descriptions</p>
        </div>

        <div className="feature-card">
          <h3>Natural Chat</h3>
          <p>Ask questions in plain English and get instant candidate insights</p>
        </div>

        <div className="feature-card">
          <h3>Analytics</h3>
          <p>Visualize your talent pool with real-time insights and metrics</p>
        </div>

        <div className="feature-card">
          <h3>Fast & Easy</h3>
          <p>Reduce time-to-hire from weeks to minutes with automation</p>
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
