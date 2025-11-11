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
    <div className="chat-container">
      <h2>Chat with Resume Database</h2>
      
      {resumeCount === 0 && (
        <div className="warning">
          ⚠️ No resumes uploaded yet. Upload some resumes first!
        </div>
      )}

      <div className="example-queries">
        <p>Try asking:</p>
        {exampleQueries.map((query, idx) => (
          <button 
            key={idx} 
            onClick={() => setInput(query)}
            className="example-btn"
          >
            {query}
          </button>
        ))}
      </div>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <div className="message assistant loading">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about candidates..."
          disabled={loading || resumeCount === 0}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || resumeCount === 0}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
