# 🚀 AI Interview - Quick Reference

## Start Here

```bash
# 1. Make sure .env is configured
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
OPENAI_API_KEY=your_openai_key

# 2. Start server
npm start

# 3. Run tests
node test-ai-interview.js
```

## API Quick Reference

### Start Interview
```bash
POST /api/ai-interview/start
Body: { "candidateId": "123" }
Returns: { channelName, agoraToken, firstQuestion }
```

### Process Answer
```bash
POST /api/ai-interview/process-answer
Body: { "candidateId": "123", "answer": "...", "questionType": "technical" }
Returns: { response, analysis, progress }
```

### Next Question
```bash
POST /api/ai-interview/next-question
Body: { "candidateId": "123" }
Returns: { question, questionType, isComplete }
```

### Get Summary
```bash
POST /api/ai-interview/summary
Body: { "candidateId": "123" }
Returns: { summary with scores and recommendations }
```

### Text-to-Speech
```bash
POST /api/tts/speak
Body: { "text": "Hello", "voice": "alloy" }
Returns: Audio file (MP3)
```

### Speech-to-Text
```bash
POST /api/stt/transcribe
Body: FormData with audio file
Returns: { transcription: "..." }
```

## Frontend Integration Snippet

```javascript
// Start interview
const { channelName, agoraToken, firstQuestion } = 
  await fetch('/api/ai-interview/start', {
    method: 'POST',
    body: JSON.stringify({ candidateId })
  }).then(r => r.json());

// Play question
const audioBlob = await fetch('/api/tts/speak', {
  method: 'POST',
  body: JSON.stringify({ text: firstQuestion })
}).then(r => r.blob());

const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();

// Process answer
const { response, analysis } = await fetch('/api/ai-interview/process-answer', {
  method: 'POST',
  body: JSON.stringify({ candidateId, answer, questionType })
}).then(r => r.json());
```

## File Structure

```
server/
├── aiInterviewService.js      # Core interview logic
├── textToSpeechService.js     # TTS (OpenAI)
├── speechToTextService.js     # STT (Whisper)
├── agoraService.js            # Voice channels
└── index.js                   # API endpoints

Documentation/
├── AI_INTERVIEW_README.md     # Main documentation
├── AI_INTERVIEW_API.md        # API reference
├── AI_INTERVIEW_SETUP.md      # Setup guide
└── QUICK_REFERENCE_AI_INTERVIEW.md  # This file

test-ai-interview.js           # Test suite
```

## Common Commands

```bash
# Test full flow
node test-ai-interview.js

# Test TTS only
curl -X POST http://localhost:3001/api/tts/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}' --output test.mp3

# Check interview status
curl http://localhost:3001/api/ai-interview/status/CANDIDATE_ID
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Agora credentials not configured" | Check .env file |
| "OpenAI API error" | Verify OPENAI_API_KEY |
| "Interview session not found" | Call /start first |
| Audio not playing | Check browser permissions |

## Next Steps

1. ✅ Backend complete
2. 🔄 Update LiveInterview.jsx
3. 🔄 Add Agora SDK integration
4. 🔄 Implement audio recording
5. 🔄 Add UI for scores/analysis

## Cost per Interview

- TTS: $0.05
- STT: $0.12
- GPT: $0.05
- Agora: $0.02
- **Total: ~$0.24**

## Support

- Full docs: `AI_INTERVIEW_README.md`
- API reference: `AI_INTERVIEW_API.md`
- Setup guide: `AI_INTERVIEW_SETUP.md`
