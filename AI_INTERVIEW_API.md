# AI Interview API Documentation

## Overview
The AI Interview system enables automated voice interviews between an AI HR interviewer and candidates based on their resume. The system uses Agora for real-time voice communication, OpenAI for intelligent conversation, and provides real-time transcription and analysis.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Candidate  │◄───────►│ Agora Voice  │◄───────►│  AI HR Bot  │
│   (Human)   │         │   Channel    │         │  (Backend)  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                   │
      │                                                   │
      ▼                                                   ▼
┌─────────────┐                                  ┌─────────────┐
│   Speech    │                                  │   OpenAI    │
│  to Text    │                                  │  GPT + TTS  │
│  (Whisper)  │                                  │  + Whisper  │
└─────────────┘                                  └─────────────┘
```

## Flow Diagram

1. **Start Interview** → Generate Agora token + Initialize AI session
2. **Candidate Joins** → Agora voice channel
3. **AI Speaks Question** → TTS converts text to audio
4. **Candidate Responds** → Voice captured via Agora
5. **Transcribe Answer** → Whisper converts audio to text
6. **AI Analyzes** → GPT evaluates response quality
7. **AI Responds** → Natural acknowledgment + next question
8. **Repeat** → Until all questions answered
9. **End Interview** → Generate summary and scores

## API Endpoints

### 1. Start AI Interview

**POST** `/api/ai-interview/start`

Start a new AI interview session for a candidate.

**Request Body:**
```json
{
  "candidateId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview session started",
  "channelName": "interview-1234567890",
  "agoraToken": "006abc123...",
  "agoraAppId": "your_app_id",
  "candidateName": "John Doe",
  "firstQuestion": "Hello John! I'm your AI interviewer today...",
  "totalQuestions": 6
}
```

### 2. Get Next Question

**POST** `/api/ai-interview/next-question`

Get the next interview question.

**Request Body:**
```json
{
  "candidateId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "isComplete": false,
  "question": "Can you describe a challenging project...",
  "questionType": "technical",
  "questionNumber": 2,
  "totalQuestions": 6
}
```

**When Complete:**
```json
{
  "success": true,
  "isComplete": true,
  "message": "Thank you for your time today..."
}
```

### 3. Process Candidate Answer

**POST** `/api/ai-interview/process-answer`

Submit and analyze a candidate's answer.

**Request Body:**
```json
{
  "candidateId": "1234567890",
  "answer": "In my previous role, I worked on a microservices architecture...",
  "questionType": "technical"
}
```

**Response:**
```json
{
  "success": true,
  "response": "That's great, thank you for sharing that detailed example.",
  "analysis": {
    "technicalAccuracy": 8,
    "communicationClarity": 9,
    "relevance": 8,
    "depth": 7,
    "strengths": ["Clear communication", "Relevant experience"],
    "improvements": ["Could provide more metrics"],
    "keyPoints": ["Demonstrated microservices knowledge"]
  },
  "progress": {
    "current": 2,
    "total": 6
  }
}
```

### 4. Get Interview Summary

**POST** `/api/ai-interview/summary`

Get the complete interview summary and evaluation.

**Request Body:**
```json
{
  "candidateId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "candidateId": "1234567890",
    "candidateName": "John Doe",
    "duration": "25 minutes",
    "questionsAnswered": 6,
    "conversationHistory": [...],
    "overallScores": {
      "technicalCompetence": 7.5,
      "communication": 8.0,
      "problemSolving": 7.0,
      "cultureFit": 8.5
    },
    "recommendation": "Proceed to next round",
    "strengths": [
      "Strong technical background",
      "Clear communication"
    ],
    "areasForImprovement": [
      "Could provide more specific examples"
    ],
    "completedAt": "2024-11-14T10:30:00Z"
  }
}
```

### 5. End Interview

**POST** `/api/ai-interview/end`

End the interview session.

**Request Body:**
```json
{
  "candidateId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview ended successfully"
}
```

### 6. Get Interview Status

**GET** `/api/ai-interview/status/:candidateId`

Check if an interview session is active.

**Response:**
```json
{
  "success": true,
  "active": true,
  "candidateName": "John Doe",
  "currentQuestion": 3,
  "totalQuestions": 6,
  "startTime": "2024-11-14T10:00:00Z"
}
```

### 7. Text-to-Speech

**POST** `/api/tts/speak`

Convert text to speech audio.

**Request Body:**
```json
{
  "text": "Hello, welcome to the interview",
  "voice": "alloy"
}
```

**Voice Options:** `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`

**Response:** Audio file (audio/mpeg)

### 8. Speech-to-Text

**POST** `/api/stt/transcribe`

Transcribe audio to text.

**Request:** Multipart form-data with audio file

**Response:**
```json
{
  "success": true,
  "transcription": "In my previous role, I worked on..."
}
```

## Integration Example

### Frontend Flow

```javascript
// 1. Start interview
const startResponse = await fetch('/api/ai-interview/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidateId: '123' })
});
const { channelName, agoraToken, agoraAppId, firstQuestion } = await startResponse.json();

// 2. Join Agora voice channel
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
await client.join(agoraAppId, channelName, agoraToken, null);

// 3. Play AI question using TTS
const audioResponse = await fetch('/api/tts/speak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: firstQuestion, voice: 'alloy' })
});
const audioBlob = await audioResponse.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();

// 4. Record candidate's answer
// (Use Agora audio recording or browser MediaRecorder)

// 5. Transcribe answer
const formData = new FormData();
formData.append('audio', audioBlob);
const transcribeResponse = await fetch('/api/stt/transcribe', {
  method: 'POST',
  body: formData
});
const { transcription } = await transcribeResponse.json();

// 6. Process answer
const processResponse = await fetch('/api/ai-interview/process-answer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    candidateId: '123',
    answer: transcription,
    questionType: 'technical'
  })
});
const { response, analysis } = await processResponse.json();

// 7. Get next question
const nextResponse = await fetch('/api/ai-interview/next-question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidateId: '123' })
});
const { question, isComplete } = await nextResponse.json();

// 8. Repeat steps 3-7 until isComplete === true

// 9. Get summary
const summaryResponse = await fetch('/api/ai-interview/summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ candidateId: '123' })
});
const { summary } = await summaryResponse.json();
```

## Environment Variables

Add to your `.env` file:

```env
PORT=3001
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
OPENAI_API_KEY=your_openai_api_key
```

## Features

✅ **Personalized Questions** - Generated based on candidate's resume and job description
✅ **Real-time Voice** - Powered by Agora for low-latency communication
✅ **AI Analysis** - Real-time evaluation of candidate responses
✅ **Natural Conversation** - AI generates contextual follow-ups
✅ **Transcription** - Automatic speech-to-text for all responses
✅ **Scoring** - Multi-dimensional evaluation (technical, communication, etc.)
✅ **Summary Reports** - Comprehensive interview analysis

## Question Types

1. **Introduction** - Opening and background
2. **Technical** - Skill-specific questions
3. **Experience** - Past work and achievements
4. **Behavioral** - Situational questions
5. **Problem Solving** - Analytical thinking
6. **Motivation** - Career goals and interests

## Scoring Dimensions

- **Technical Accuracy** (1-10)
- **Communication Clarity** (1-10)
- **Relevance** (1-10)
- **Depth** (1-10)
- **Overall Competence** (1-10)

## Best Practices

1. **Test Agora Connection** - Ensure stable voice channel before starting
2. **Handle Network Issues** - Implement reconnection logic
3. **Save Transcripts** - Store all conversations for review
4. **Provide Feedback** - Show real-time progress to candidates
5. **Privacy** - Inform candidates about recording and AI usage
6. **Fallback** - Have manual interview option if AI fails

## Troubleshooting

### Issue: Agora connection fails
- Check AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env
- Verify token generation is working
- Check network firewall settings

### Issue: TTS not working
- Verify OPENAI_API_KEY is valid
- Check OpenAI API quota
- Ensure audio format is supported by browser

### Issue: Transcription fails
- Check audio file format (supports mp3, mp4, mpeg, mpga, m4a, wav, webm)
- Verify file size is under 25MB
- Ensure audio quality is sufficient

## Future Enhancements

- [ ] Multi-language support
- [ ] Video interview capability
- [ ] Screen sharing for technical assessments
- [ ] Live coding challenges
- [ ] Sentiment analysis
- [ ] Facial expression analysis
- [ ] Custom question templates
- [ ] Interview scheduling
- [ ] Candidate feedback collection
