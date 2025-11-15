import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function ChatInterface({ resumeCount }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('/api/chat', { message: input })
      const aiMessage = { role: 'assistant', content: response.data.response }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}` 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const exampleQueries = [
    "Who has Python and Machine Learning skills?",
    "Find candidates with 5+ years of experience",
    "Show me candidates with React expertise",
    "Compare the top 2 candidates",
    "Give me a breakdown of top skills in the pool"
  ]

  return (
    <div className="chat-container-modern">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-icon">💬</div>
          <div>
            <h2>AI Chat Assistant</h2>
            <p className="chat-subtitle">Ask anything about your {resumeCount} candidates</p>
          </div>
        </div>
        {resumeCount > 0 && (
          <div className="resume-count-badge">
            {resumeCount} resumes loaded
          </div>
        )}
      </div>
      
      {resumeCount === 0 && (
        <div className="warning-modern">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>No resumes uploaded yet</strong>
            <p>Upload some resumes first to start chatting!</p>
          </div>
        </div>
      )}

      {messages.length === 0 && resumeCount > 0 && (
        <div className="example-queries-modern">
          <p className="example-title">💡 Try asking:</p>
          <div className="example-grid">
            {exampleQueries.map((query, idx) => (
              <button 
                key={idx} 
                onClick={() => setInput(query)}
                className="example-btn-modern"
              >
                <span className="example-icon">✨</span>
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-modern">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-modern ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-header">
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                <span className="message-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-modern assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area-modern">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about candidates, skills, experience..."
          disabled={loading || resumeCount === 0}
          rows="1"
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || resumeCount === 0}
          className="send-btn-modern"
        >
          {loading ? '⏳' : '📤'} Send
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
