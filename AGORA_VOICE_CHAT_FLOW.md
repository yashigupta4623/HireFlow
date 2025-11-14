# 🎤 Agora Voice Chat Integration Flow

## 1. Complete Voice Chat Flow (Detailed)

```mermaid
sequenceDiagram
    participant Recruiter
    participant UI as React UI<br/>(VoiceChat.jsx)
    participant Speech as Web Speech API
    participant Backend as Node.js Server
    participant Agora as Agora RTC Cloud
    participant OpenAI as OpenAI GPT-4
    participant DB as Resume Database

    Note over Recruiter,DB: 🎯 INITIALIZATION PHASE
    
    Recruiter->>UI: Click "Start Voice Chat"
    UI->>UI: Initialize Agora Client<br/>AgoraRTC.createClient()
    
    UI->>Backend: POST /api/agora/token<br/>{channelName: "resume-screening"}
    
    Backend->>Backend: Load Credentials<br/>AGORA_APP_ID<br/>AGORA_APP_CERTIFICATE
    Backend->>Backend: Generate RTC Token<br/>RtcTokenBuilder.buildTokenWithUid()
    Backend->>Backend: Set Expiry: 1 hour<br/>Role: PUBLISHER
    
    Backend-->>UI: {token, appId}
    
    Note over Recruiter,DB: 🔗 CONNECTION PHASE
    
    UI->>Agora: client.join(appId, channel, token)
    Agora-->>UI: ✅ Connection Established
    
    UI->>UI: Create Microphone Track<br/>AgoraRTC.createMicrophoneAudioTrack()
    UI->>Agora: client.publish([audioTrack])
    Agora-->>UI: ✅ Audio Published
    
    UI->>Speech: Initialize Speech Recognition<br/>new SpeechRecognition()
    UI->>Speech: recognition.start()
    
    UI-->>Recruiter: 🎤 "Listening... Speak your question"
    
    Note over Recruiter,DB: 🗣️ VOICE QUERY PHASE
    
    Recruiter->>Speech: Speaks: "Who has React experience?"
    Speech->>Speech: Continuous Recognition<br/>interimResults: true
    Speech->>UI: onresult event<br/>transcript: "Who has React experience?"
    
    UI-->>Recruiter: Display: "You're saying: Who has..."
    
    Speech->>UI: Final Transcript<br/>isFinal: true
    
    UI->>Backend: POST /api/chat<br/>{message: "Who has React experience?"}
    
    Note over Recruiter,DB: 🤖 AI PROCESSING PHASE
    
    Backend->>DB: Load Resume Database<br/>getResumesFromFile()
    DB-->>Backend: Array of Resumes
    
    Backend->>Backend: Build Context<br/>Map candidates with skills
    
    Backend->>OpenAI: POST /v1/chat/completions<br/>{<br/>  model: "gpt-4",<br/>  messages: [system, user],<br/>  context: resume_data<br/>}
    
    OpenAI->>OpenAI: Analyze Query<br/>Match Skills<br/>Rank Candidates
    
    OpenAI-->>Backend: AI Response:<br/>"Found 3 candidates with React..."
    
    Backend-->>UI: {<br/>  response: "Found 3 candidates...",<br/>  audioUrl: null<br/>}
    
    Note over Recruiter,DB: 🔊 AUDIO RESPONSE PHASE
    
    UI->>UI: Check for Google TTS Audio
    
    alt Google TTS Available
        UI->>UI: Play Audio File
    else Browser TTS
        UI->>UI: speechSynthesis.speak()<br/>Select Natural Voice<br/>Rate: 0.95, Pitch: 1.1
    end
    
    UI-->>Recruiter: 🔊 Plays Audio Response
    UI-->>Recruiter: 💬 Displays Text Response
    
    Note over Recruiter,DB: 🔄 CONTINUOUS CONVERSATION
    
    Recruiter->>Speech: Speaks: "Show me their experience"
    Speech->>UI: New Transcript
    UI->>Backend: POST /api/chat (Follow-up)
    Backend->>OpenAI: Process with Context
    OpenAI-->>Backend: Detailed Response
    Backend-->>UI: Response
    UI-->>Recruiter: Audio + Text Response
    
    Note over Recruiter,DB: 🛑 TERMINATION PHASE
    
    Recruiter->>UI: Click "End Voice Chat"
    
    UI->>Speech: recognition.stop()
    UI->>UI: speechSynthesis.cancel()
    UI->>UI: audioTrack.close()
    UI->>Agora: client.leave()
    
    Agora-->>UI: ✅ Disconnected
    UI-->>Recruiter: "Disconnected"
```

---

## 2. Agora Voice Chat Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[VoiceChat Component]
        B[Agora RTC Client]
        C[Web Speech API]
        D[Audio Track Manager]
        E[UI State Manager]
    end
    
    subgraph "Communication Layer"
        F[Agora SDK<br/>agora-rtc-sdk-ng]
        G[HTTP Client<br/>Axios]
    end
    
    subgraph "Backend Layer"
        H[Express Server]
        I[Agora Service<br/>agoraService.js]
        J[Conversation Handler<br/>conversationHandler.js]
        K[Resume Database<br/>resumes.json]
    end
    
    subgraph "External Services"
        L[Agora RTC Cloud<br/>Global Network]
        M[OpenAI API<br/>GPT-4]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    
    B --> F
    A --> G
    
    G --> H
    H --> I
    H --> J
    J --> K
    
    F <--> L
    J <--> M
    
    I -.Token Generation.-> F
    
    style L fill:#ff6b6b,color:#fff
    style M fill:#4ecdc4,color:#fff
```

---

## 3. Token Generation Flow

```mermaid
flowchart TD
    A[User Clicks<br/>"Start Voice Chat"] --> B[Frontend Requests Token]
    
    B --> C[POST /api/agora/token]
    
    C --> D{Credentials<br/>Configured?}
    
    D -->|No| E[❌ Error:<br/>"Agora credentials not configured"]
    D -->|Yes| F[Load Environment Variables]
    
    F --> G[AGORA_APP_ID]
    F --> H[AGORA_APP_CERTIFICATE]
    
    G --> I[RtcTokenBuilder]
    H --> I
    
    I --> J[Set Parameters]
    J --> K[Channel: "resume-screening"]
    J --> L[UID: 0 auto-assign]
    J --> M[Role: PUBLISHER]
    J --> N[Expiry: 3600 seconds]
    
    K --> O[Build Token]
    L --> O
    M --> O
    N --> O
    
    O --> P{Token Valid?}
    
    P -->|Yes| Q[✅ Return Token + AppId]
    P -->|No| R[❌ Error: Token generation failed]
    
    Q --> S[Frontend Receives Token]
    S --> T[Join Agora Channel]
    T --> U[✅ Connected]
    
    style U fill:#4caf50,color:#fff
    style E fill:#f44336,color:#fff
    style R fill:#f44336,color:#fff
```

---

## 4. Speech Recognition Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: Component Mounted
    
    Idle --> Initializing: User Clicks "Start"
    Initializing --> CheckSupport: Check Browser Support
    
    CheckSupport --> NotSupported: No Speech API
    CheckSupport --> Ready: Speech API Available
    
    NotSupported --> [*]: Show Error Message
    
    Ready --> Listening: recognition.start()
    
    Listening --> Processing: User Speaks
    Processing --> InterimResult: Partial Transcript
    InterimResult --> Processing: Continue Speaking
    
    Processing --> FinalResult: Speech Ends
    FinalResult --> SendingQuery: Send to Backend
    
    SendingQuery --> WaitingResponse: API Call
    WaitingResponse --> PlayingAudio: Response Received
    
    PlayingAudio --> Listening: Audio Complete
    
    Listening --> Stopping: User Clicks "End"
    Stopping --> Cleanup: Stop Recognition
    Cleanup --> [*]: Disconnected
    
    note right of Listening
        Continuous recognition
        interimResults: true
        lang: 'en-US'
    end note
    
    note right of FinalResult
        isFinal: true
        Trigger API call
    end note
```

---

## 5. Audio Track Management

```mermaid
flowchart LR
    subgraph "Track Creation"
        A[Request Microphone<br/>Permission]
        B[Browser Permission<br/>Dialog]
        C{Permission<br/>Granted?}
    end
    
    subgraph "Track Publishing"
        D[Create Audio Track<br/>createMicrophoneAudioTrack]
        E[Configure Track<br/>Quality Settings]
        F[Publish to Channel<br/>client.publish]
    end
    
    subgraph "Track Management"
        G[Monitor Track State]
        H[Handle Mute/Unmute]
        I[Track Volume Control]
    end
    
    subgraph "Track Cleanup"
        J[Stop Publishing<br/>client.unpublish]
        K[Close Track<br/>track.close]
        L[Release Resources]
    end
    
    A --> B
    B --> C
    C -->|Yes| D
    C -->|No| M[Show Error]
    
    D --> E
    E --> F
    
    F --> G
    G --> H
    G --> I
    
    H --> J
    I --> J
    J --> K
    K --> L
    
    style C fill:#ff9800
    style F fill:#4caf50
    style L fill:#2196f3
```

---

## 6. Voice Chat Component Lifecycle

```mermaid
flowchart TD
    A[Component Mount] --> B[Initialize State]
    
    B --> C[Create Agora Client<br/>AgoraRTC.createClient]
    B --> D[Initialize Speech Recognition<br/>new SpeechRecognition]
    
    C --> E[Set Event Listeners]
    D --> F[Configure Recognition<br/>continuous: true<br/>interimResults: true]
    
    E --> G[Ready State]
    F --> G
    
    G --> H{User Action?}
    
    H -->|Start| I[Join Channel Flow]
    H -->|End| J[Leave Channel Flow]
    
    I --> K[Request Token]
    K --> L[Join Agora Channel]
    L --> M[Create Audio Track]
    M --> N[Publish Track]
    N --> O[Start Recognition]
    O --> P[Active State]
    
    P --> Q{User Speaking?}
    Q -->|Yes| R[Process Speech]
    Q -->|No| P
    
    R --> S[Send Query]
    S --> T[Receive Response]
    T --> U[Play Audio]
    U --> P
    
    J --> V[Stop Recognition]
    V --> W[Close Audio Track]
    W --> X[Leave Channel]
    X --> Y[Cleanup State]
    
    Y --> Z[Component Unmount]
    
    style P fill:#4caf50,color:#fff
    style Z fill:#f44336,color:#fff
```

---

## 7. Error Handling Flow

```mermaid
flowchart TD
    A[Voice Chat Operation] --> B{Error Occurs?}
    
    B -->|No| C[✅ Success]
    B -->|Yes| D{Error Type?}
    
    D -->|Token Error| E[Credentials Not Configured]
    D -->|Network Error| F[Connection Failed]
    D -->|Permission Error| G[Microphone Access Denied]
    D -->|Speech API Error| H[Browser Not Supported]
    D -->|Agora Error| I[Channel Join Failed]
    
    E --> J[Show Error Message:<br/>"Configure Agora credentials"]
    F --> K[Show Error Message:<br/>"Check internet connection"]
    G --> L[Show Error Message:<br/>"Allow microphone access"]
    H --> M[Show Error Message:<br/>"Use Chrome browser"]
    I --> N[Show Error Message:<br/>"Try again later"]
    
    J --> O[Log Error]
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[Update UI State]
    P --> Q[Enable Retry]
    
    style E fill:#ff5252
    style F fill:#ff5252
    style G fill:#ff5252
    style H fill:#ff5252
    style I fill:#ff5252
```

---

## 8. Data Flow in Voice Chat

```mermaid
graph LR
    subgraph "Input"
        A[👤 User Voice]
    end
    
    subgraph "Processing Pipeline"
        B[🎤 Microphone]
        C[📡 Agora RTC]
        D[🗣️ Speech-to-Text]
        E[📝 Text Query]
        F[🤖 AI Processing]
        G[💬 Text Response]
        H[🔊 Text-to-Speech]
    end
    
    subgraph "Output"
        I[🔊 Audio Response]
        J[💬 Text Display]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    G --> J
    
    style F fill:#4ecdc4
    style C fill:#ff6b6b
```

---

## 9. Agora vs Traditional Voice Chat

```mermaid
graph TB
    subgraph "Traditional Approach"
        A1[Browser MediaRecorder]
        A2[Record Audio File]
        A3[Upload to Server]
        A4[Process on Server]
        A5[Download Response]
        A6[High Latency 2-5s]
    end
    
    subgraph "Agora Approach"
        B1[Agora RTC SDK]
        B2[Real-time Streaming]
        B3[Low Latency <400ms]
        B4[Global CDN]
        B5[Automatic Optimization]
        B6[Better Quality]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> A6
    
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    
    style A6 fill:#ff5252
    style B6 fill:#4caf50
```

---

## 10. Voice Chat Features

```mermaid
mindmap
  root((Voice Chat<br/>Features))
    Real-time Communication
      Agora RTC
      Low Latency
      HD Audio
      Global Network
    Speech Recognition
      Web Speech API
      Continuous Mode
      Interim Results
      Multi-language
    AI Integration
      OpenAI GPT-4
      Context Aware
      Natural Responses
      Resume Database
    Text-to-Speech
      Browser TTS
      Natural Voices
      Adjustable Speed
      Multiple Accents
    User Experience
      Hands-free
      Visual Feedback
      Error Handling
      Easy Controls
```

---

## 11. Implementation Code Flow

```mermaid
flowchart TD
    A[VoiceChat.jsx] --> B[useState Hooks]
    A --> C[useEffect Hook]
    A --> D[useRef Hook]
    
    B --> B1[joined state]
    B --> B2[client state]
    B --> B3[messages state]
    B --> B4[transcript state]
    
    C --> C1[Initialize Agora Client]
    C --> C2[Setup Speech Recognition]
    C --> C3[Cleanup on Unmount]
    
    D --> D1[recognitionRef]
    
    A --> E[Event Handlers]
    E --> E1[joinChannel]
    E --> E2[leaveChannel]
    E --> E3[handleVoiceQuery]
    
    E1 --> F[API Calls]
    F --> F1[POST /api/agora/token]
    F --> F2[POST /api/chat]
    
    E3 --> G[AI Processing]
    G --> G1[Send to Backend]
    G --> G2[Receive Response]
    G --> G3[Play Audio]
    
    style A fill:#61dafb
    style G fill:#4ecdc4
```

---

## Usage Instructions

### For Presentations:
1. Copy any diagram to https://mermaid.live/
2. Customize colors if needed
3. Export as PNG/SVG (high resolution)
4. Insert into PowerPoint

### For Documentation:
- These render automatically on GitHub
- Use in README.md or technical docs
- Great for onboarding new developers

### Key Points to Highlight:
- ⚡ Real-time communication via Agora
- 🎤 Hands-free voice interaction
- 🤖 AI-powered responses
- 🔊 Natural text-to-speech
- 🌐 Global low-latency network

Perfect for technical presentations! 🚀
