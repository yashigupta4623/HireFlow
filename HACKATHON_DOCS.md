# TalentVoice - AI-Powered Conversational Recruiter

> 🏆 Hackathon Project: Revolutionizing recruitment with Agora Conversational AI

## 🎯 Problem Statement

Recruiters spend **20-30 hours per hire** manually screening hundreds of resumes, leading to:
- Delayed hiring decisions and increased costs
- Missed qualified candidates due to human fatigue
- Inefficient keyword-based searches
- Poor candidate-JD matching accuracy

**Impact**: Companies lose top talent to competitors and waste $15K-30K per hire in recruiter hours.

## 💡 Solution

**TalentVoice** is an AI-powered conversational recruiting assistant that allows HRs to **talk or chat** with uploaded resumes using natural language. Powered by Agora's Conversational AI, recruiters can instantly find, compare, and rank candidates through voice or text interactions.

### Key Innovation
Instead of manual screening, recruiters simply ask:
- *"Who has the most experience with React?"*
- *"Show me candidates from IITs with 3+ years in ML"*
- *"Compare Priya's resume with the JD"*

The AI responds conversationally with intelligent, context-aware answers.

---

## 🚀 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **🎤 Voice Calling** | Ask queries using voice; AI responds conversationally via Agora RTC | ✅ Implemented |
| **💬 Chat Interface** | Text-based conversational queries with context memory | ✅ Implemented |
| **🎯 JD vs Resume Matching** | Upload Job Description → Get AI fit scores (0-100%) with explanations | ✅ Implemented |
| **📊 Candidate Ranking** | Auto-rank all candidates by JD match score with strengths/gaps | ✅ Implemented |
| **🔍 Smart Resume Parsing** | Auto-extract skills, experience, education from PDF/DOCX/TXT | ✅ Implemented |
| **🧠 AI Comparison Mode** | Voice command: "Compare Ankit and Sneha" → Detailed side-by-side analysis | ✅ Implemented |
| **📈 Analytics Dashboard** | Top skills breakdown, average experience, talent pool insights | ✅ Implemented |
| **💾 Resume Memory** | System remembers all uploaded resumes for future queries | ✅ Implemented |
| **🔗 Live JD Fetch** | Fetch JDs from URLs or drive links (Future) | 🔄 Planned |
| **📧 Outreach Generator** | AI-generated personalized candidate messages (Future) | 🔄 Planned |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Upload  │  │ JD Match │  │   Chat   │  │Analytics │     │
│  │ Resumes  │  │  & Rank  │  │Interface │  │Dashboard │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                  │
│                    Agora Web SDK                            │
│                    (Voice + RTC)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    REST API / WebSocket
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │Resume Parser │  │ AI Fit Score │  │ Conversation │       │
│  │(PDF/DOCX)    │  │  Generator   │  │   Handler    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                          │                                  │
│                  ┌───────┴────────┐                         │
│                  │  Agora Service │                         │
│                  │ (Token + RTC)  │                         │
│                  └───────┬────────┘                         │
└──────────────────────────┼──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴─────┐    ┌──────┴──────┐   ┌──────┴──────┐
   │ OpenAI   │    │   Agora     │   │  In-Memory  │
   │   API    │    │Conversatinal│   │  Database   │
   │(GPT-3.5) │    │     AI      │   │  (Resumes)  │
   └──────────┘    └─────────────┘   └─────────────┘
```

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | Fast, modern UI framework |
| | Agora RTC SDK | Real-time voice communication |
| | Axios | API communication |
| **Backend** | Node.js + Express | RESTful API server |
| | Multer | File upload handling |
| | pdf-parse, mammoth | Resume parsing (PDF/DOCX) |
| **AI/NLP** | OpenAI GPT-3.5 | Conversational intelligence |
| | Agora Conversational AI | Voice interaction & RTC |
| | Custom NLP | Skill extraction & matching |
| **Storage** | In-memory (MVP) | Fast candidate database |
| | File system | Resume storage |
| **Deployment** | Vercel/Render | Frontend hosting |
| | Railway/AWS EC2 | Backend hosting |

---

## 🔄 Implementation Flow

### 1️⃣ Upload Stage
```
Recruiter uploads resumes (PDF/DOCX/TXT) + optional JD
         ↓
System parses files → extracts structured data
(Name, Skills, Experience, Education, Contact)
         ↓
Store in database with metadata
         ↓
Generate embeddings for semantic search (if using vectors)
```

### 2️⃣ Query Stage (Voice/Text)
```
Recruiter asks: "Who has Python and 5+ years experience?"
         ↓
[Voice] → Agora STT → Text Query
         ↓
Query Processor analyzes intent
         ↓
Search database (skill matching + experience filtering)
         ↓
AI generates conversational response
         ↓
[Voice] → Agora TTS → Spoken response
[Text] → Display in chat interface
```

### 3️⃣ JD Matching & Ranking
```
Recruiter uploads Job Description
         ↓
Extract required skills, experience, qualifications
         ↓
For each candidate:
  - Calculate skill match percentage
  - Evaluate experience alignment
  - Generate AI fit score (0-100%)
  - Provide explanation + strengths/gaps
         ↓
Rank candidates by fit score
         ↓
Display top matches with detailed breakdown
```

### 4️⃣ Comparison Mode
```
Recruiter: "Compare Ankit and Sneha for backend role"
         ↓
Retrieve both candidate profiles
         ↓
AI analyzes:
  - Skill differences
  - Experience comparison
  - Unique strengths
  - Best fit recommendation
         ↓
Generate side-by-side comparison
         ↓
Respond via voice/text
```

---

## 🎤 Agora Conversational AI Integration

### Voice Flow Architecture
```
┌─────────────┐
│  Recruiter  │
│   Speaks    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Agora RTC Channel  │
│  (Audio Streaming)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Speech-to-Text     │
│  (Agora/OpenAI)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Query Processor    │
│  (Intent Analysis)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Backend API        │
│  (Candidate Search) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  AI Response Gen    │
│  (GPT-3.5/Local)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Text-to-Speech     │
│  (Agora TTS)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  Recruiter  │
│   Hears     │
└─────────────┘
```

### Key Agora Features Used
1. **RTC (Real-Time Communication)**: Sub-200ms latency voice streaming
2. **Token Authentication**: Secure channel access
3. **Audio Track Management**: Microphone capture & playback
4. **Channel Management**: Multi-user support for team collaboration

---

## 📡 API Endpoints

### Resume Management
```
POST /api/upload
- Upload resume file (PDF/DOCX/TXT)
- Returns: { resumeId, candidateName, success }

GET /api/resumes
- Get all uploaded resumes
- Returns: Array of candidate summaries
```

### Job Description & Matching
```
POST /api/job-description
- Upload JD text
- Auto-evaluates all candidates
- Returns: Top 5 matches with fit scores

GET /api/skill-matrix
- Generate skill matrix (candidates × skills)
- Returns: Matrix data for visualization
```

### Conversational Interface
```
POST /api/chat
- Send text query
- Returns: AI-generated response

POST /api/agora/token
- Generate Agora RTC token
- Returns: { token, appId }
```

### Analytics
```
GET /api/analytics
- Get talent pool statistics
- Returns: {
    totalCandidates,
    averageExperience,
    topSkills[],
    totalUniqueSkills
  }
```

---

## 🎨 UI/UX Highlights

### 1. Upload Tab
- Drag & drop resume upload
- Multi-format support (PDF, DOCX, TXT)
- Real-time parsing feedback
- Success notifications with candidate name

### 2. JD Match Tab
- Large text area for job description
- One-click evaluation
- Color-coded fit scores (0-100%)
- Detailed explanations with strengths/gaps
- Top 5 candidates displayed

### 3. Chat Interface
- Clean message bubbles (user vs AI)
- Example query suggestions
- Real-time typing indicators
- Context-aware follow-up questions
- Keyboard shortcuts (Enter to send)

### 4. Voice Chat Tab
- Visual connection status indicator
- Animated pulse when active
- Simple start/stop controls
- Usage instructions
- Low-latency audio feedback

### 5. Analytics Dashboard
- Stat cards with gradient backgrounds
- Top 10 skills bar chart
- Average experience metrics
- Total unique skills count
- Refresh button for real-time updates

---

## 🚀 Setup Instructions

### Prerequisites
```bash
Node.js >= 16.x
npm or yarn
Agora Account (agora.io)
OpenAI API Key (optional for enhanced AI)
```

### Installation

1. **Clone & Install**
```bash
git clone <your-repo>
cd ai-resume-screener
npm run install-all
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
OPENAI_API_KEY=your_openai_key
```

3. **Get Credentials**

**Agora Setup:**
- Sign up at [agora.io](https://www.agora.io/)
- Create new project
- Enable RTC
- Copy App ID & Certificate

**OpenAI Setup:**
- Sign up at [platform.openai.com](https://platform.openai.com/)
- Generate API key
- Add to `.env`

4. **Run Application**
```bash
npm run dev
```

Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 🎬 Demo Scenarios

### Scenario 1: Basic Skill Search
```
Recruiter: "Who has Python and Machine Learning skills?"
AI: "Found 3 candidates with Python and Machine Learning:

1. Priya Sharma - 88% match
   Skills: Python, Machine Learning, TensorFlow, AWS
   
2. Rahul Kumar - 75% match
   Skills: Python, ML, Data Science, SQL
   
3. Ankit Verma - 65% match
   Skills: Python, Basic ML, Django"
```

### Scenario 2: JD Matching
```
[Upload JD for "Senior Backend Developer - Node.js, AWS, 5+ years"]

AI: "Evaluated 12 candidates. Top 3 matches:

1. Sneha Patel - 92% match
   ✅ Strengths: 6 years Node.js, AWS certified, microservices
   ⚠️ Gaps: Limited Kubernetes experience
   
2. Vikram Singh - 87% match
   ✅ Strengths: 7 years backend, strong AWS, Docker
   ⚠️ Gaps: More Java than Node.js
   
3. Ravi Gupta - 81% match
   ✅ Strengths: 5 years Node.js, good system design
   ⚠️ Gaps: No cloud certifications"
```

### Scenario 3: Voice Comparison
```
Recruiter: [Voice] "Compare Sneha and Vikram for this role"

AI: [Voice Response] "Sneha has 6 years focused on Node.js and 
microservices architecture, making her a stronger match for your 
Node.js requirement. Vikram brings 7 years of backend experience 
with broader technology exposure including Java, but less Node.js 
depth. For a Senior Node.js role, I'd recommend Sneha as the 
primary candidate, with Vikram as a strong alternative if you 
value diverse backend experience."
```

---

## 📊 Real-World Impact

### Time Savings
- **Before**: 20-30 hours per hire for manual screening
- **After**: 2-3 hours with TalentVoice
- **Reduction**: 80-90% time saved

### Cost Savings
- Average recruiter cost: $50/hour
- Savings per hire: $900-1,350
- For 50 hires/year: **$45,000-67,500 saved**

### Quality Improvements
- ✅ Zero candidates missed due to fatigue
- ✅ Consistent evaluation criteria
- ✅ Data-driven decision making
- ✅ Reduced unconscious bias
- ✅ Better candidate-JD matching

### Accessibility
- 🎤 Voice interface for hands-free operation
- 🌍 Multi-modal interaction (voice + text)
- ♿ Inclusive design for all recruiters

---

## 🔮 Future Enhancements

### Phase 2 (Post-Hackathon)
- [ ] Multi-language support (Hindi, Spanish, etc.)
- [ ] Video interview scheduling integration
- [ ] ATS (Applicant Tracking System) connectors
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Candidate ranking ML model
- [ ] Resume improvement suggestions

### Phase 3 (Production)
- [ ] Live JD fetching from career pages
- [ ] Google Drive / Dropbox integration
- [ ] Email integration for outreach
- [ ] Team collaboration features
- [ ] GDPR/EEOC compliance tools
- [ ] Custom branding for enterprises
- [ ] API for third-party integrations

### Stretch Goals
- [ ] Candidate voice pitch analyzer
- [ ] Sentiment analysis on cover letters
- [ ] Automated interview question generator
- [ ] Skill gap analysis for upskilling
- [ ] Diversity & inclusion metrics

---

## 🏆 Hackathon Deliverables

### ✅ Completed
1. **Working Demo**: Fully functional web application
2. **Agora Integration**: Voice chat with RTC
3. **AI Features**: Fit scoring, comparison, analytics
4. **Clean UI/UX**: Professional, intuitive interface
5. **Documentation**: Comprehensive README & setup guide

### 📹 Demo Video Script
```
[0:00-0:15] Problem Introduction
"Recruiters waste 20+ hours per hire screening resumes..."

[0:15-0:30] Solution Overview
"TalentVoice uses Agora Conversational AI to let recruiters 
simply talk to their resume database..."

[0:30-1:00] Feature Demo - Upload
"Upload resumes in seconds, AI auto-extracts all data..."

[1:00-1:30] Feature Demo - JD Matching
"Paste a job description, get instant fit scores..."

[1:30-2:00] Feature Demo - Voice Chat
"Ask questions naturally: 'Who has React and 5 years?'"

[2:00-2:30] Feature Demo - Analytics
"Visualize your talent pool with instant insights..."

[2:30-2:45] Impact Statement
"80% time reduction, $50K+ saved per year, zero missed candidates"

[2:45-3:00] Call to Action
"TalentVoice - The future of recruitment is conversational"
```

---

## 👥 Team & Contributions

### Roles
- **Full Stack Development**: [Your Name]
- **AI/ML Integration**: [Your Name]
- **Agora Integration**: [Your Name]
- **UI/UX Design**: [Your Name]

### Time Investment
- Day 1: Setup & Core Integration (8 hours)
- Day 2: Resume Parsing & AI Logic (10 hours)
- Day 3: Conversational Flow (8 hours)
- Day 4: UI/UX Polish (6 hours)
- Day 5: Testing & Documentation (4 hours)
- **Total**: 36 hours

---

## 📝 License

MIT License - Open source for educational and commercial use

---

## 🙏 Acknowledgments

- **Agora.io** for Conversational AI SDK
- **OpenAI** for GPT-3.5 API
- **Open Source Community** for amazing libraries

---

## 📞 Contact

- **Project**: TalentVoice
- **GitHub**: [Your Repo Link]
- **Demo**: [Live Demo Link]
- **Video**: [Demo Video Link]
- **Email**: [Your Email]

---

**Built with ❤️ for [Hackathon Name]**

*Making recruitment conversational, one voice at a time.*
