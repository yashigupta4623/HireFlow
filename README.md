# TalentVoice - AI Resume Screener with Agora Conversational AI

An intelligent resume screening solution that allows recruiters to have natural conversations with uploaded resumes using AI. Built with Agora's Conversational AI for real-time voice interactions.

> 🏆 **Hackathon Project** | 🎤 **Voice-First Recruitment** | 🤖 **AI-Powered Matching**

## Features

- 📤 Upload resumes (PDF, DOCX, TXT)
- 🤖 AI-powered resume parsing and analysis
- 💬 Text-based conversational interface
- 🎤 Voice chat using Agora RTC
- 🔍 Smart candidate search by skills, experience, education
- 🎯 JD matching with AI fit scores (0-100%)
- 📊 Analytics dashboard with insights
- ⚡ Real-time responses

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- AI: OpenAI GPT-3.5
- Voice: Agora RTC SDK
- Resume Parsing: pdf-parse, mammoth

## Setup

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=3001
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
OPENAI_API_KEY=your_openai_api_key
```

### 3. Get Agora Credentials

1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a new project
3. Get your App ID and App Certificate
4. Add them to your `.env` file

### 4. Get OpenAI API Key

1. Sign up at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add it to your `.env` file

### 5. Run the Application

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend on http://localhost:3000

## Usage

### Upload Resumes
1. Go to "Upload" tab
2. Select PDF, DOCX, or TXT files
3. Click "Upload Resume"

### JD Matching
1. Go to "JD Match" tab
2. Paste job description
3. Click "Evaluate Candidates"
4. See top matches with fit scores

### Text Chat
1. Go to "Chat" tab
2. Ask questions like:
   - "Who has Python and Machine Learning skills?"
   - "Find candidates with 5+ years of experience"
   - "Compare top 2 candidates"

### Voice Chat
1. Go to "Voice" tab
2. Click "Start Voice Chat"
3. Speak naturally to query candidates
4. AI responds with relevant information

### Analytics
1. Go to "Analytics" tab
2. View top skills, average experience
3. See talent pool insights

## Project Structure

```
├── server/
│   ├── index.js              # Express server
│   ├── resumeParser.js       # Resume parsing logic
│   ├── conversationHandler.js # AI conversation logic
│   ├── agoraService.js       # Agora token generation
│   ├── fitScoring.js         # JD matching & scoring
│   ├── skillMatrix.js        # Skill analysis
│   └── comparison.js         # Candidate comparison
├── client/
│   └── src/
│       ├── components/
│       │   ├── ResumeUpload.jsx
│       │   ├── ChatInterface.jsx
│       │   ├── VoiceChat.jsx
│       │   ├── JobDescription.jsx
│       │   └── Analytics.jsx
│       ├── App.jsx
│       └── main.jsx
└── uploads/                  # Uploaded resumes
```

## Innovation Highlights

1. **Agora Integration**: Real-time voice conversations for natural recruiter interactions
2. **AI-Powered Parsing**: Intelligent extraction of skills, experience, and education
3. **Conversational Interface**: Natural language queries instead of complex filters
4. **Multi-Modal**: Both text and voice interaction options
5. **Real-World Impact**: Dramatically reduces time-to-hire for recruiters

## Documentation

- **HACKATHON_DOCS.md** - Complete technical documentation
- **PROJECT_SUMMARY.md** - Quick reference and demo guide

## License

MIT
