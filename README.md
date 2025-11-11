# HireFlow
hireflow
# AI Resume Screener with Agora Conversational AI

An intelligent resume screening solution that allows recruiters to have natural conversations with uploaded resumes using AI. Built with Agora's Conversational AI for real-time voice interactions.

## Features

- 📤 Upload resumes (PDF, DOCX, TXT)
- 🤖 AI-powered resume parsing and analysis
- 💬 Text-based conversational interface
- 🎤 Voice chat using Agora RTC
- 🔍 Smart candidate search by skills, experience, education
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
1. Go to "Upload Resumes" tab
2. Select PDF, DOCX, or TXT files
3. Click "Upload Resume"

### Text Chat
1. Go to "Text Chat" tab
2. Ask questions like:
   - "Who has Python and Machine Learning skills?"
   - "Find candidates with 5+ years of experience"
   - "Show me candidates with React expertise"

### Voice Chat
1. Go to "Voice Chat" tab
2. Click "Start Voice Chat"
3. Speak naturally to query candidates
4. AI responds with relevant information

## API Endpoints

- `POST /api/upload` - Upload resume
- `POST /api/chat` - Send chat message
- `POST /api/agora/token` - Get Agora RTC token
- `GET /api/resumes` - Get all resumes

## Project Structure

```
├── server/
│   ├── index.js              # Express server
│   ├── resumeParser.js       # Resume parsing logic
│   ├── conversationHandler.js # AI conversation logic
│   └── agoraService.js       # Agora token generation
├── client/
│   └── src/
│       ├── components/
│       │   ├── ResumeUpload.jsx
│       │   ├── ChatInterface.jsx
│       │   └── VoiceChat.jsx
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

## Future Enhancements

- Speech-to-text for voice queries
- Multi-language support
- Advanced filtering and ranking
- Integration with ATS systems
- Candidate comparison features
- Video interview scheduling

## License

MIT
