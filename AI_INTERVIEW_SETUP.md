# AI Interview Setup Guide

## Quick Start

### 1. Install Dependencies

The required packages should already be installed, but if needed:

```bash
npm install openai agora-access-token
```

### 2. Configure Environment Variables

Update your `.env` file with:

```env
# Agora Configuration
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

**Get Agora Credentials:**
1. Sign up at https://console.agora.io/
2. Create a new project
3. Copy App ID and App Certificate

**Get OpenAI API Key:**
1. Sign up at https://platform.openai.com/
2. Go to API Keys section
3. Create new secret key

### 3. Test the Backend

Start your server:

```bash
npm start
```

Server should start on `http://localhost:3001`

### 4. Test API Endpoints

#### Test 1: Upload a Resume

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "resume=@path/to/resume.pdf"
```

Note the `resumeId` from the response.

#### Test 2: Start AI Interview

```bash
curl -X POST http://localhost:3001/api/ai-interview/start \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "YOUR_RESUME_ID"}'
```

You should receive:
- Agora channel name
- Agora token
- First interview question
- Total questions count

#### Test 3: Get Next Question

```bash
curl -X POST http://localhost:3001/api/ai-interview/next-question \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "YOUR_RESUME_ID"}'
```

#### Test 4: Process Answer

```bash
curl -X POST http://localhost:3001/api/ai-interview/process-answer \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "YOUR_RESUME_ID",
    "answer": "I have 5 years of experience with React and Node.js...",
    "questionType": "technical"
  }'
```

#### Test 5: Text-to-Speech

```bash
curl -X POST http://localhost:3001/api/tts/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, welcome to the interview", "voice": "alloy"}' \
  --output test-audio.mp3
```

Play the `test-audio.mp3` file to hear the AI voice.

#### Test 6: Get Interview Summary

```bash
curl -X POST http://localhost:3001/api/ai-interview/summary \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "YOUR_RESUME_ID"}'
```

## How It Works

### Backend Flow

```
1. Candidate uploads resume
   ↓
2. HR starts AI interview for candidate
   ↓
3. Backend initializes interview session:
   - Loads candidate data (skills, experience, education)
   - Generates personalized questions
   - Creates Agora voice channel
   - Returns first question
   ↓
4. AI asks question (TTS converts to audio)
   ↓
5. Candidate responds via voice (Agora)
   ↓
6. Audio transcribed to text (Whisper)
   ↓
7. AI analyzes answer quality (GPT)
   ↓
8. AI generates natural response
   ↓
9. Repeat steps 4-8 for all questions
   ↓
10. Generate final summary and scores
```

### Key Components

**aiInterviewService.js**
- Manages interview sessions
- Generates personalized questions
- Analyzes candidate responses
- Tracks conversation history

**textToSpeechService.js**
- Converts AI questions to audio
- Uses OpenAI TTS API
- Supports multiple voice options

**speechToTextService.js**
- Transcribes candidate audio responses
- Uses OpenAI Whisper API
- Handles multiple audio formats

**agoraService.js**
- Generates Agora tokens
- Manages voice channels
- Handles real-time communication

## Integration with Frontend

Your frontend needs to:

1. **Start Interview**
   - Call `/api/ai-interview/start`
   - Get Agora credentials

2. **Join Voice Channel**
   - Use Agora SDK to join channel
   - Enable microphone

3. **Play AI Questions**
   - Call `/api/tts/speak` for each question
   - Play audio to candidate

4. **Record Answers**
   - Capture audio from microphone
   - Send to `/api/stt/transcribe`

5. **Process Responses**
   - Send transcription to `/api/ai-interview/process-answer`
   - Get AI feedback and next question

6. **Complete Interview**
   - Call `/api/ai-interview/summary`
   - Display results

## Voice Options

OpenAI TTS supports these voices:

- **alloy** - Neutral, balanced (recommended for HR)
- **echo** - Clear, professional
- **fable** - Warm, friendly
- **onyx** - Deep, authoritative
- **nova** - Energetic, engaging
- **shimmer** - Soft, gentle

Test different voices to find the best fit for your use case.

## Customization

### Modify Interview Questions

Edit `server/aiInterviewService.js`, function `generateInterviewQuestions()`:

```javascript
const questions = [
  {
    type: 'introduction',
    text: `Your custom question here...`
  },
  // Add more questions
];
```

### Adjust Scoring Criteria

Edit `server/aiInterviewService.js`, function `analyzeAnswer()`:

```javascript
const prompt = `Analyze this interview answer and provide scores:
- Add your custom criteria here
- Modify scoring dimensions
- Change evaluation logic
`;
```

### Change AI Voice

When calling TTS endpoint, specify voice:

```javascript
fetch('/api/tts/speak', {
  method: 'POST',
  body: JSON.stringify({
    text: question,
    voice: 'nova' // Change this
  })
});
```

## Troubleshooting

### "Agora credentials not configured"
- Check `.env` file has AGORA_APP_ID and AGORA_APP_CERTIFICATE
- Restart server after updating .env

### "OpenAI API error"
- Verify OPENAI_API_KEY is valid
- Check API quota at https://platform.openai.com/usage
- Ensure billing is set up

### "Interview session not found"
- Session expires after inactivity
- Call `/api/ai-interview/start` again
- Check candidateId is correct

### Audio not playing
- Check browser audio permissions
- Verify audio format compatibility
- Test with different browsers

### Transcription fails
- Ensure audio file is valid format
- Check file size (max 25MB)
- Verify audio quality is sufficient

## Production Considerations

1. **Rate Limiting** - Add rate limits to prevent abuse
2. **Authentication** - Secure endpoints with JWT/OAuth
3. **Session Management** - Use Redis for distributed sessions
4. **Error Handling** - Implement comprehensive error handling
5. **Logging** - Add detailed logging for debugging
6. **Monitoring** - Track API usage and performance
7. **Scaling** - Use load balancer for multiple instances
8. **Cost Management** - Monitor OpenAI and Agora usage

## Cost Estimates

**OpenAI Costs (per interview):**
- TTS: ~$0.015 per 1000 characters (6 questions ≈ $0.05)
- Whisper: ~$0.006 per minute (20 min interview ≈ $0.12)
- GPT-3.5: ~$0.002 per 1000 tokens (analysis ≈ $0.05)
- **Total per interview: ~$0.22**

**Agora Costs:**
- Voice: ~$0.99 per 1000 minutes
- 20 min interview ≈ $0.02

**Total Cost per Interview: ~$0.24**

## Next Steps

1. ✅ Backend is ready
2. 🔄 Integrate with frontend (LiveInterview.jsx)
3. 🔄 Add UI for interview controls
4. 🔄 Implement audio recording
5. 🔄 Add real-time transcription display
6. 🔄 Show AI analysis scores
7. 🔄 Display interview summary

See `AI_INTERVIEW_API.md` for detailed API documentation.
