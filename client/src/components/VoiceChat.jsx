import { useState, useEffect, useRef } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import axios from 'axios'

function VoiceChat() {
  const [joined, setJoined] = useState(false)
  const [client, setClient] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [status, setStatus] = useState('Ready to connect')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setClient(agoraClient)

    // Initialize Web Speech API if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript)
          handleVoiceQuery(finalTranscript.trim())
        } else {
          setTranscript(interimTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setStatus(`Recognition error: ${event.error}`)
      }

      recognition.onend = () => {
        if (isListening) {
          recognition.start() // Restart if still listening
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (localAudioTrack) {
        localAudioTrack.close()
      }
      if (agoraClient) {
        agoraClient.leave()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleVoiceQuery = async (query) => {
    if (!query || isProcessing) return

    setIsProcessing(true)
    setMessages(prev => [...prev, { role: 'user', content: query }])

    try {
      const response = await axios.post('/api/chat', { query })
      const aiResponse = response.data.response

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      
      // Speak the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Query error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }])
    } finally {
      setIsProcessing(false)
      setTranscript('')
    }
  }

  const joinChannel = async () => {
    if (!client) return

    try {
      setStatus('Connecting...')
      
      const response = await axios.post('/api/agora/token', {
        channelName: 'resume-screening',
        uid: 0
      })

      const { token, appId } = response.data

      await client.join(appId, 'resume-screening', token, null)
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      await client.publish([audioTrack])
      
      setLocalAudioTrack(audioTrack)
      setJoined(true)
      setStatus('Connected! Speak to ask about candidates')
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
        setStatus('Listening... Speak your question')
      } else {
        setStatus('Speech recognition not supported in this browser. Please use Chrome.')
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`)
      console.error('Join channel error:', error)
    }
  }

  const leaveChannel = async () => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (localAudioTrack) {
      localAudioTrack.close()
      setLocalAudioTrack(null)
    }
    
    if (client) {
      await client.leave()
    }
    
    setJoined(false)
    setStatus('Disconnected')
    setTranscript('')
  }

  return (
    <div className="voice-chat-container">
      <h2>🎤 Voice Chat with Agora</h2>
      <p>Have a voice conversation about candidates using Agora's real-time communication</p>

      <div className="voice-status">
        <div className={`status-indicator ${joined ? 'active' : ''}`}></div>
        <p>{status}</p>
      </div>

      {transcript && (
        <div className="live-transcript">
          <strong>You're saying:</strong> {transcript}
        </div>
      )}

      <div className="voice-controls">
        {!joined ? (
          <button onClick={joinChannel} className="join-btn">
            🎤 Start Voice Chat
          </button>
        ) : (
          <button onClick={leaveChannel} className="leave-btn">
            🔇 End Voice Chat
          </button>
        )}
      </div>

      {messages.length > 0 && (
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {isProcessing && (
            <div className="message assistant loading">
              Thinking...
            </div>
          )}
        </div>
      )}

      <div className="voice-info">
        <h3>How it works:</h3>
        <ul>
          <li>Click "Start Voice Chat" to connect via Agora</li>
          <li>Speak naturally to ask about candidates (e.g., "Who has Python skills?")</li>
          <li>AI will respond with relevant candidate information</li>
          <li>The response will be spoken back to you</li>
          <li>Works best in Chrome browser</li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceChat
