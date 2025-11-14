import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import AgoraRTC from 'agora-rtc-sdk-ng'

function LiveInterview() {
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [interviewActive, setInterviewActive] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState([])
  const [realTimeScores, setRealTimeScores] = useState({
    technicalAccuracy: 0,
    communicationClarity: 0,
    confidenceLevel: 0,
    answerRelevance: 0
  })
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(null)
  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchCandidates()
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setClient(agoraClient)

    return () => {
      if (localVideoTrack) localVideoTrack.close()
      if (localAudioTrack) localAudioTrack.close()
      if (agoraClient) agoraClient.leave()
    }
  }, [])

  const fetchCandidates = async () => {
    try {
      console.log('Fetching candidates...')
      const response = await axios.get('/api/resumes')
      console.log('Candidates response:', response.data)
      console.log('Number of candidates:', response.data.resumes?.length)
      setCandidates(response.data.resumes || [])
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
      setCandidates([])
    }
  }

  const startInterview = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate first')
      return
    }

    setLoading(true)
    try {
      // Generate personalized questions
      const response = await axios.post('/api/interview/generate-questions', {
        candidateId: selectedCandidate
      })
      
      setQuestions(response.data.questions)
      setCurrentQuestionIndex(0)
      
      // Start Agora video
      await startVideoCall()
      
      setInterviewActive(true)
      setIsRecording(true)
      
      // Add first question to transcript
      setTranscript([{
        speaker: 'AI Interviewer',
        text: response.data.questions[0].question,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      alert('Failed to start interview: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const startVideoCall = async () => {
    try {
      const response = await axios.post('/api/agora/token', {
        channelName: 'interview-room',
        uid: 0
      })

      const { token, appId } = response.data
      await client.join(appId, 'interview-room', token, null)
      
      const videoTrack = await AgoraRTC.createCameraVideoTrack()
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      
      await client.publish([videoTrack, audioTrack])
      
      setLocalVideoTrack(videoTrack)
      setLocalAudioTrack(audioTrack)
      
      if (videoRef.current) {
        videoTrack.play(videoRef.current)
      }
    } catch (error) {
      console.error('Video call error:', error)
    }
  }

  const submitAnswer = async (answer) => {
    if (!answer.trim()) return

    // Add answer to transcript
    const newTranscript = [...transcript, {
      speaker: 'Candidate',
      text: answer,
      timestamp: new Date().toISOString()
    }]
    setTranscript(newTranscript)

    // Get AI analysis
    try {
      const response = await axios.post('/api/interview/analyze-answer', {
        candidateId: selectedCandidate,
        question: questions[currentQuestionIndex].question,
        answer: answer
      })

      setRealTimeScores(response.data.scores)
      setAiSuggestions(response.data.suggestions)

      // Move to next question or end
      if (currentQuestionIndex < questions.length - 1) {
        const nextQuestion = questions[currentQuestionIndex + 1]
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        
        setTranscript([...newTranscript, {
          speaker: 'AI Interviewer',
          text: nextQuestion.question,
          timestamp: new Date().toISOString()
        }])
      } else {
        endInterview()
      }
    } catch (error) {
      console.error('Answer analysis error:', error)
    }
  }

  const endInterview = async () => {
    try {
      // Save interview data
      await axios.post('/api/interview/save', {
        candidateId: selectedCandidate,
        transcript: transcript,
        scores: realTimeScores,
        duration: transcript.length
      })

      // Stop video
      if (localVideoTrack) {
        localVideoTrack.close()
        setLocalVideoTrack(null)
      }
      if (localAudioTrack) {
        localAudioTrack.close()
        setLocalAudioTrack(null)
      }
      if (client) {
        await client.leave()
      }

      setInterviewActive(false)
      setIsRecording(false)
      alert('Interview completed and saved!')
    } catch (error) {
      console.error('End interview error:', error)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="live-interview-container">
      <h2>🎥 Live Interview with AI Assistance</h2>
      <p>Conduct video interviews with real-time AI scoring and insights</p>

      {!interviewActive ? (
        <div className="interview-setup">
          <div className="setup-section">
            <h3>Select Candidate</h3>
            {candidates.length === 0 && (
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>
                Loading candidates... ({candidates.length} found)
              </p>
            )}
            <select 
              value={selectedCandidate || ''} 
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="candidate-select"
            >
              <option value="">Choose a candidate... ({candidates.length} available)</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={startInterview} 
            disabled={!selectedCandidate || loading}
            className="start-interview-btn"
          >
            {loading ? '⏳ Preparing Interview...' : '🎥 Start Interview'}
          </button>

          <div className="interview-features">
            <h3>Interview Features</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Personalized questions based on resume + JD</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Real-time scoring on 4 key metrics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💡</span>
                <span>AI-powered follow-up suggestions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📝</span>
                <span>Full transcript recording</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="interview-active">
          <div className="interview-layout">
            <div className="video-section">
              <div className="video-container">
                <div ref={videoRef} className="video-feed"></div>
                {isRecording && <div className="recording-indicator">🔴 Recording</div>}
              </div>

              <div className="current-question">
                <h4>Question {currentQuestionIndex + 1} of {questions.length}</h4>
                <p>{questions[currentQuestionIndex]?.question}</p>
              </div>

              <div className="answer-input">
                <textarea
                  placeholder="Type your answer here or speak..."
                  className="answer-textarea"
                  id="answer-input"
                />
                <button 
                  onClick={() => {
                    const answer = document.getElementById('answer-input').value
                    submitAnswer(answer)
                    document.getElementById('answer-input').value = ''
                  }}
                  className="submit-answer-btn"
                >
                  Submit Answer
                </button>
              </div>

              <button onClick={endInterview} className="end-interview-btn">
                End Interview
              </button>
            </div>

            <div className="ai-panel">
              <div className="real-time-scores">
                <h4>Real-Time Scores</h4>
                <div className="score-item">
                  <span>Technical Accuracy</span>
                  <div className="score-display">
                    <span style={{ color: getScoreColor(realTimeScores.technicalAccuracy) }}>
                      {realTimeScores.technicalAccuracy}/10
                    </span>
                    <div className="mini-bar">
                      <div 
                        className="mini-fill" 
                        style={{ 
                          width: `${realTimeScores.technicalAccuracy * 10}%`,
                          backgroundColor: getScoreColor(realTimeScores.technicalAccuracy)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="score-item">
                  <span>Communication Clarity</span>
                  <div className="score-display">
                    <span style={{ color: getScoreColor(realTimeScores.communicationClarity) }}>
                      {realTimeScores.communicationClarity}/10
                    </span>
                    <div className="mini-bar">
                      <div 
                        className="mini-fill"
                        style={{ 
                          width: `${realTimeScores.communicationClarity * 10}%`,
                          backgroundColor: getScoreColor(realTimeScores.communicationClarity)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="score-item">
                  <span>Confidence Level</span>
                  <div className="score-display">
                    <span style={{ color: getScoreColor(realTimeScores.confidenceLevel) }}>
                      {realTimeScores.confidenceLevel}/10
                    </span>
                    <div className="mini-bar">
                      <div 
                        className="mini-fill"
                        style={{ 
                          width: `${realTimeScores.confidenceLevel * 10}%`,
                          backgroundColor: getScoreColor(realTimeScores.confidenceLevel)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="score-item">
                  <span>Answer Relevance</span>
                  <div className="score-display">
                    <span style={{ color: getScoreColor(realTimeScores.answerRelevance) }}>
                      {realTimeScores.answerRelevance}/10
                    </span>
                    <div className="mini-bar">
                      <div 
                        className="mini-fill"
                        style={{ 
                          width: `${realTimeScores.answerRelevance * 10}%`,
                          backgroundColor: getScoreColor(realTimeScores.answerRelevance)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="ai-suggestions">
                  <h4>💡 AI Suggestions</h4>
                  <ul>
                    {aiSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="transcript-panel">
                <h4>📝 Transcript</h4>
                <div className="transcript-content">
                  {transcript.map((entry, idx) => (
                    <div key={idx} className={`transcript-entry ${entry.speaker === 'Candidate' ? 'candidate' : 'interviewer'}`}>
                      <strong>{entry.speaker}:</strong> {entry.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LiveInterview
