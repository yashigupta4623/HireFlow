function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to TalentVoice</h1>
        <p className="hero-subtitle">AI-Powered Recruitment Platform with Voice Intelligence</p>
        
        <div className="hero-description">
          <p>Transform your hiring process with cutting-edge AI technology. TalentVoice combines intelligent resume analysis, real-time voice interviews, and data-driven insights to help you find the perfect candidates faster.</p>
        </div>
      </div>

      <div className="features-showcase">
        <h2>What We Offer</h2>
        
        <div className="feature-grid">
          <div className="feature-box">
            <div className="feature-icon">📤</div>
            <h3>Smart Resume Upload</h3>
            <p>Upload resumes in multiple formats. Our AI automatically extracts skills, experience, and qualifications.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🏆</div>
            <h3>Intelligent Ranking</h3>
            <p>Automatically rank candidates based on experience, skills, and profile activity. Find top talent instantly.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🎥</div>
            <h3>AI Voice Interviews</h3>
            <p>Conduct automated voice interviews with AI. Get real-time transcription and candidate analysis.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🧠</div>
            <h3>Deep Insights</h3>
            <p>AI-powered psychological profiling and culture fit analysis for every candidate.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">💬</div>
            <h3>AI Chat Assistant</h3>
            <p>Ask questions about candidates in natural language. Get instant answers from your talent pool.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Visualize your talent pool with skill breakdowns, experience distribution, and hiring trends.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">📧</div>
            <h3>Email Outreach</h3>
            <p>Find and contact qualified candidates automatically with personalized email campaigns.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🔗</div>
            <h3>Easy Integration</h3>
            <p>Embed our recruitment tools directly into your career page with simple API integration.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Use the navigation menu above to explore our features and start building your talent pipeline today.</p>
        <div className="cta-stats">
          <div className="stat-item">
            <div className="stat-number">10x</div>
            <div className="stat-label">Faster Screening</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">AI Availability</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
