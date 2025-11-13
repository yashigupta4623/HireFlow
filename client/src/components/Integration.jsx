import { useState } from 'react'
import axios from 'axios'

function Integration() {
  const [companyName, setCompanyName] = useState('')
  const [careerPageUrl, setCareerPageUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [showCode, setShowCode] = useState(false)

  const generateIntegration = () => {
    const baseUrl = window.location.origin
    const code = `<!-- TalentVoice Integration -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed.js';
    script.setAttribute('data-company', '${companyName}');
    script.setAttribute('data-api-key', '${apiKey}');
    document.head.appendChild(script);
  })();
</script>

<!-- TalentVoice Widget Container -->
<div id="talentvoice-widget"></div>

<style>
  #talentvoice-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  }
</style>`

    setEmbedCode(code)
    setShowCode(true)
  }

  const saveIntegration = async () => {
    try {
      await axios.post('/api/integration/save', {
        companyName,
        careerPageUrl,
        webhookUrl,
        apiKey
      })
      alert('Integration settings saved!')
    } catch (error) {
      alert('Failed to save integration: ' + error.message)
    }
  }

  const generateApiKey = () => {
    const key = 'tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiKey(key)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    alert('Embed code copied to clipboard!')
  }

  return (
    <div className="integration-container">
      <h2>🔗 Career Page Integration</h2>
      <p>Integrate TalentVoice with your company's career page</p>

      <div className="integration-form">
        <div className="form-section">
          <h3>Company Details</h3>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="integration-input"
            />
          </div>

          <div className="form-group">
            <label>Career Page URL</label>
            <input
              type="url"
              placeholder="https://company.com/careers"
              value={careerPageUrl}
              onChange={(e) => setCareerPageUrl(e.target.value)}
              className="integration-input"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>API Configuration</h3>
          <div className="form-group">
            <label>API Key</label>
            <div className="input-with-button">
              <input
                type="text"
                placeholder="Generate an API key"
                value={apiKey}
                readOnly
                className="integration-input"
              />
              <button onClick={generateApiKey} className="generate-btn">
                Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Webhook URL (Optional)</label>
            <input
              type="url"
              placeholder="https://company.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="integration-input"
            />
            <small>Receive notifications when candidates apply</small>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={saveIntegration} className="save-btn">
            💾 Save Integration
          </button>
          <button onClick={generateIntegration} className="generate-code-btn">
            📋 Generate Embed Code
          </button>
        </div>
      </div>

      {showCode && (
        <div className="embed-code-section">
          <h3>Embed Code</h3>
          <p>Copy and paste this code into your career page HTML:</p>
          <div className="code-block">
            <pre>{embedCode}</pre>
            <button onClick={copyToClipboard} className="copy-btn">
              📋 Copy Code
            </button>
          </div>
        </div>
      )}

      <div className="integration-features">
        <h3>Integration Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h4>AI Chat Widget</h4>
            <p>Candidates can chat with AI about job openings</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h4>Resume Upload</h4>
            <p>Direct resume submission from your career page</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h4>Voice Screening</h4>
            <p>Optional voice interview capability</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Real-time Analytics</h4>
            <p>Track candidate engagement and applications</p>
          </div>
        </div>
      </div>

      <div className="api-docs">
        <h3>API Endpoints</h3>
        <div className="endpoint">
          <code>POST /api/public/apply</code>
          <p>Submit candidate application from career page</p>
        </div>
        <div className="endpoint">
          <code>GET /api/public/jobs</code>
          <p>Fetch available job openings</p>
        </div>
        <div className="endpoint">
          <code>POST /api/public/chat</code>
          <p>Chat with AI about opportunities</p>
        </div>
      </div>
    </div>
  )
}

export default Integration
