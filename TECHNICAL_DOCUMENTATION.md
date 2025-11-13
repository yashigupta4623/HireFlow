# TalentVoice - Technical Documentation

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture](#architecture)
3. [Agora Integration](#agora-integration)
4. [System Flow](#system-flow)
5. [Wireframes](#wireframes)
6. [API Endpoints](#api-endpoints)

---

## 🛠️ Tech Stack Overview

### Frontend
| Technology | Purpose | Why Used |
|------------|---------|----------|
| **React 18** | UI Framework | Component-based architecture, efficient rendering, hooks for state management |
| **Vite** | Build Tool | Fast development server, optimized production builds, HMR support |
| **Axios** | HTTP Client | Promise-based API calls, request/response interceptors |
| **Agora RTC SDK** | Real-time Communication | Voice chat functionality, low-latency audio streaming |

### Backend
| Technology | Purpose | Why Used |
|------------|---------|----------|
| **Node.js** | Runtime Environment | JavaScript on server, non-blocking I/O, large ecosystem |
| **Express.js** | Web Framework | RESTful API creation, middleware support, routing |
| **Multer** | File Upload | Handling multipart/form-data for resume uploads |
| **Axios** | HTTP Client | External API calls (GitHub, LeetCode, profile analysis) |
| **pdf-parse** | PDF Parsing | Extract text from PDF resumes |
| **mammoth** | DOCX Parsing | Extract text from Word document resumes |

### AI/ML Integration
| Technology | Purpose | Why Used |
|------------|---------|----------|
| **OpenAI API** | Natural Language Processing | Resume parsing, candidate matching, conversational AI |
| **Custom Algorithms** | Scoring & Ranking | Fit scoring, skill matching, activity analysis |

### Real-time Communication
| Technology | Purpose | Why Used |
|------------|---------|----------|
| **Agora RTC** | Voice Chat | Low-latency voice communication, token-based security |
| **Agora Token Server** | Authentication | Secure channel access, temporary tokens |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Upload  │  │ JD Match │  │ Ranking  │  │   Chat   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Voice   │  │Analytics │  │ Outreach │  │Integration│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js API Server                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Resume    │  │    Fit     │  │  Profile   │    │   │
│  │  │  Parser    │  │  Scoring   │  │  Analyzer  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │Conversation│  │   Skill    │  │   Agora    │    │   │
│  │  │  Handler   │  │   Matrix   │  │  Service   │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ OpenAI   │  │  Agora   │  │  GitHub  │  │ LeetCode │   │
│  │   API    │  │   RTC    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎙️ Agora Integration

### Purpose
Agora RTC SDK enables real-time voice communication between recruiters and AI for voice-based candidate screening.

### Integration Flow

```
┌──────────────┐
│   User       │
│  (Recruiter) │
└──────┬───────┘
       │ 1. Click "Start Voice Chat"
       ↓
┌──────────────────────┐
│  VoiceChat Component │
│  (React Frontend)    │
└──────┬───────────────┘
       │ 2. Request Token
       ↓
┌──────────────────────┐
│  POST /api/agora/token│
│  (Express Backend)   │
└──────┬───────────────┘
       │ 3. Generate Token
       ↓
┌──────────────────────┐
│  Agora Token Service │
│  (agoraService.js)   │
└──────┬───────────────┘
       │ 4. Return Token + App ID
       ↓
┌──────────────────────┐
│  Agora RTC Client    │
│  (SDK Initialization)│
└──────┬───────────────┘
       │ 5. Join Channel
       ↓
┌──────────────────────┐
│  Agora Cloud         │
│  (RTC Infrastructure)│
└──────┬───────────────┘
       │ 6. Audio Stream
       ↓
┌──────────────────────┐
│  Voice Communication │
│  (Real-time Audio)   │
└──────────────────────┘
```

### Key Components

**1. Frontend (VoiceChat.jsx)**
```javascript
// Initialize Agora Client
const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

// Request token from backend
const { token, appId } = await axios.post('/api/agora/token', {
  channelName: 'resume-screening',
  uid: 0
})

// Join channel with token
await client.join(appId, 'resume-screening', token, null)

// Create and publish audio track
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
await client.publish([audioTrack])
```

**2. Backend (agoraService.js)**
```javascript
// Generate RTC token with privileges
const token = RtcTokenBuilder.buildTokenWithUid(
  appId,
  appCertificate,
  channelName,
  uid,
  role,
  privilegeExpiredTs
)
```

### Security Features
- **Token-based Authentication**: Temporary tokens expire after set duration
- **Channel Isolation**: Each session uses unique channel names
- **Role-based Access**: Publisher/Subscriber roles for access control

---

## 🔄 System Flow

### 1. Resume Upload & Processing Flow
```
User uploads resume
       ↓
Multer receives file
       ↓
Save to /uploads directory
       ↓
Resume Parser extracts:
  - Name, Email, Phone
  - Skills, Experience
  - Education, Certifications
  - Profile Links (GitHub, LinkedIn, etc.)
       ↓
Profile Analyzer checks:
  - GitHub activity (commits, repos)
  - LeetCode problems solved
  - LinkedIn profile status
       ↓
Store in resumeDatabase with:
  - Parsed data
  - Profile links
  - Upload timestamp
       ↓
Return success response
```

### 2. Job Description Matching Flow
```
User pastes/uploads JD
       ↓
Store as currentJobDescription
       ↓
Fit Scoring evaluates each candidate:
  - Extract JD requirements
  - Compare with candidate skills
  - Calculate fit score (0-100%)
  - Generate explanation
  - Identify strengths & gaps
       ↓
Sort candidates by fit score
       ↓
Return top matches with details
```

### 3. Candidate Ranking Flow
```
User selects sort criteria
       ↓
For each candidate:
  - Calculate base score
    (experience × 10 + internships × 5)
  - Analyze profile activity
    (GitHub, LeetCode, LinkedIn)
  - Calculate activity boost (up to 20%)
  - Add boost to base score
       ↓
Sort by selected criteria:
  - Experience
  - Internships
  - Combined Score
  - Profile Activity
       ↓
Return ranked list with:
  - Scores, tags, profile links
```

### 4. Outreach Email Flow
```
User enters/loads JD
       ↓
Filter candidates by upload date
  (last 1, 3, 6, or 12 months)
       ↓
Evaluate filtered candidates against JD
       ↓
Show matches with 60%+ fit score
       ↓
User selects candidates
       ↓
Auto-generate email template with:
  - Personalized greeting
  - JD description
  - Availability request
       ↓
Send emails to selected candidates
       ↓
Return success count
```

---

## 📐 Wireframes

### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  TalentVoice                              👤 User ▼     │
│  AI-Powered Conversational Recruiter                    │
├─────────────────────────────────────────────────────────┤
│ [📤 Upload] [🎯 JD Match] [🏆 Ranking] [💬 Chat]       │
│ [🎤 Voice] [📊 Analytics] [📧 Outreach] [🔗 Integration]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    CONTENT AREA                          │
│                                                          │
│  (Dynamic content based on selected tab)                │
│                                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📊 X Resumes in Database                               │
└─────────────────────────────────────────────────────────┘
```

### Upload Section
```
┌─────────────────────────────────────────────────────────┐
│  Upload Candidate Resumes                               │
│  Supported formats: PDF, DOCX, TXT                      │
├─────────────────────────────────────────────────────────┤
│  [📁 Upload File] [🔗 Upload Link]                      │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │     Drag & drop or click to upload resume        │ │
│  │                                                   │ │
│  │              [Choose File]                        │ │
│  │                                                   │ │
│  │     Selected: resume.pdf                          │ │
│  │                                                   │ │
│  │          [Upload Resume]                          │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ✅ John Doe uploaded successfully!                     │
└─────────────────────────────────────────────────────────┘
```

### Ranking Section
```
┌─────────────────────────────────────────────────────────┐
│  🏆 Candidate Rankings                                  │
│  Rank candidates based on experience and activity       │
├─────────────────────────────────────────────────────────┤
│  Sort by: [Combined Score ▼]  [🔄 Refresh]             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ #1  John Doe                                    │   │
│  │     💼 5 years exp  🎓 2 internships            │   │
│  │     ⭐ Score: 60.0  🔥 +15.5 activity boost     │   │
│  │     🐙 GitHub  💼 LinkedIn  💻 LeetCode         │   │
│  │     Skills: React, Node.js, Python...           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ #2  Jane Smith                                  │   │
│  │     💼 3 years exp  🎓 1 internship             │   │
│  │     ⭐ Score: 45.0                               │   │
│  │     Skills: Java, Spring Boot, AWS...           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Voice Chat Section
```
┌─────────────────────────────────────────────────────────┐
│  Voice Chat with Agora                                  │
│  Have a voice conversation about candidates             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  ● Ready to connect                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│              [🎤 Start Voice Chat]                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  How it works:                                  │   │
│  │  ✓ Click "Start Voice Chat" to connect         │   │
│  │  ✓ Speak naturally to ask about candidates     │   │
│  │  ✓ AI responds with relevant information       │   │
│  │  ✓ Real-time, low-latency communication        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Outreach Section
```
┌─────────────────────────────────────────────────────────┐
│  📧 Candidate Outreach                                  │
│  Search recent candidates and send availability emails  │
├─────────────────────────────────────────────────────────┤
│  Job Description:              [📥 Load Uploaded JD]    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Senior Full Stack Developer...                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  Search resumes from last: [6 months ▼]                │
│                                                          │
│  [🔍 Search Candidates]                                 │
├─────────────────────────────────────────────────────────┤
│  Found 5 Matching Candidates  [✓ Select All] [✗ Clear] │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑ John Doe                                      │   │
│  │   📧 john@email.com                             │   │
│  │   Match: 85%  Uploaded: 2 months ago           │   │
│  │   Strong match for full-stack role...           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Email Template:                                        │
│  Subject: [Exciting Opportunity: Senior Developer]     │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Hi {{name}},                                      │ │
│  │ We have an exciting opportunity...               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  [📤 Send Emails to 3 Candidate(s)]                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Resume Management
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload resume file |
| `/api/upload-link` | POST | Upload resume from URL |
| `/api/resumes` | GET | Get all resumes |

### Job Description
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/job-description` | POST | Save JD and evaluate candidates |
| `/api/job-description-link` | POST | Fetch JD from URL |
| `/api/stored-jd` | GET | Get stored JD |

### Candidate Analysis
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/rank-candidates` | GET | Rank candidates with activity analysis |
| `/api/chat` | POST | Chat with AI about candidates |
| `/api/analytics` | GET | Get candidate analytics |
| `/api/skill-matrix` | GET | Get skill distribution |

### Outreach
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/outreach/search` | POST | Search recent candidates by JD |
| `/api/outreach/send-emails` | POST | Send availability emails |

### Agora Integration
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agora/token` | POST | Generate Agora RTC token |

### Career Page Integration
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/integration/save` | POST | Save integration settings |
| `/api/public/apply` | POST | Public application endpoint |
| `/api/public/jobs` | GET | Get job openings |
| `/api/public/chat` | POST | Public chat endpoint |

---

## 🔐 Security Considerations

1. **Agora Tokens**: Temporary tokens with expiration
2. **API Keys**: Required for career page integration
3. **File Upload**: Validated file types and size limits
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Should be implemented for production

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
├─────────────────────────────────────────────────────────┤
│  Frontend (Vite Build)                                  │
│    ↓ Deploy to                                          │
│  Vercel / Netlify / AWS S3 + CloudFront                │
├─────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express)                            │
│    ↓ Deploy to                                          │
│  AWS EC2 / Heroku / DigitalOcean / Railway             │
├─────────────────────────────────────────────────────────┤
│  File Storage                                           │
│    ↓ Use                                                │
│  AWS S3 / Google Cloud Storage                         │
├─────────────────────────────────────────────────────────┤
│  Database (Future)                                      │
│    ↓ Migrate to                                         │
│  MongoDB / PostgreSQL                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Metrics

- **Resume Upload**: < 3 seconds
- **JD Matching**: < 5 seconds for 100 candidates
- **Voice Chat Latency**: < 200ms (via Agora)
- **Profile Activity Check**: < 2 seconds per candidate
- **API Response Time**: < 500ms average

---

## 🔮 Future Enhancements

1. **Database Integration**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Email Service**: Integrate SendGrid/AWS SES for actual email sending
3. **Video Interviews**: Add video capability using Agora Video SDK
4. **AI Voice Assistant**: Integrate speech-to-text for voice screening
5. **Advanced Analytics**: Dashboard with charts and insights
6. **Mobile App**: React Native version for mobile recruiting
7. **Calendar Integration**: Schedule interviews via Google Calendar/Outlook
8. **ATS Integration**: Connect with existing ATS systems

---

## 📝 Notes

- Current implementation uses in-memory storage (not production-ready)
- Email sending is simulated (logs to console)
- Profile activity analysis requires API rate limit consideration
- Agora free tier has usage limits

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Maintained By**: TalentVoice Team
