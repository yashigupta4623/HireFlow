import { useState, useEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import axios from 'axios'

function VoiceChat() {
  const [joined, setJoined] = useState(false)
  const [client, setClient] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [status, setStatus] = useState('Ready to connect')

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setClient(agoraClient)

    return () => {
      if (localAudioTrack) {
        localAudioTrack.close()
      }
      if (agoraClient) {
        agoraClient.leave()
      }
    }
  }, [])

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
    } catch (error) {
      setStatus(`Error: ${error.message}`)
      console.error('Join channel error:', error)
    }
  }

  const leaveChannel = async () => {
    if (localAudioTrack) {
      localAudioTrack.close()
      setLocalAudioTrack(null)
    }
    
    if (client) {
      await client.leave()
    }
    
    setJoined(false)
    setStatus('Disconnected')
  }

  return (
    <div className="voice-chat-container">
      <h2>Voice Chat with Agora</h2>
      <p>Have a voice conversation about candidates using Agora's real-time communication</p>

      <div className="voice-status">
        <div className={`status-indicator ${joined ? 'active' : ''}`}></div>
        <p>{status}</p>
      </div>

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

      <div className="voice-info">
        <h3>How it works:</h3>
        <ul>
          <li>Click "Start Voice Chat" to connect via Agora</li>
          <li>Speak naturally to ask about candidates</li>
          <li>AI will respond with relevant candidate information</li>
          <li>Real-time, low-latency voice communication</li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceChat
