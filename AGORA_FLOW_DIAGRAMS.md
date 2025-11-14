# 🎯 Agora Flow Diagrams

## 1. Agora Voice Chat Flow

```mermaid
sequenceDiagram
    participant User as Recruiter
    participant Frontend as React App
    participant Backend as Node.js Server
    participant Agora as Agora RTC
    participant AI as OpenAI API

    User->>Frontend: Click "Start Voice Chat"
    Frontend->>Backend: POST /api/agora/token
    Backend->>Backend: Generate RTC Token
    Backend-->>Frontend: Return {token, appId}
    
    Frontend->>Agora: Join Channel with Token
    Agora-->>Frontend: Connection Established
    
    Frontend->>Frontend: Create Microphone Track
    Frontend->>Agora: Publish Audio Track
    
    User->>Frontend: Speak Question
    Frontend->>Frontend: Web Speech API (Speech-to-Text)
    Frontend->>Backend: POST /api/chat {message}
    
    Backend->>AI: Process Query with Context
    AI-->>Backend: AI Response
    
    Backend-->>Frontend: {response, audioUrl}
    Frontend->>Frontend: Text-to-Speech
    Frontend->>User: Play Audio Response
    
    User->>Frontend: Click "End Voice Chat"
    Frontend->>Agora: Leave Channel
    Frontend->>Frontend: Close Audio Track
```

---

## 2. Agora Video Interview Flow

```mermaid
sequenceDiagram
    participant Recruiter
    participant Frontend as React App
    participant Backend as Node.js Server
    participant Agora as Agora RTC
    participant AI as OpenAI API
    participant DB as Resume Database

    Recruiter->>Frontend: Select Candidate
    Recruiter->>Frontend: Click "Start Interview"
    
    Frontend->>Backend: POST /api/interview/generate-questions
    Backend->>DB: Fetch Candidate Resume
    Backend->>AI: Generate Personalized Questions
    AI-->>Backend: Interview Questions
    Backend-->>Frontend: {questions}
    
    Frontend->>Backend: POST /api/agora/token
    Backend-->>Frontend: {token, appId}
    
    Frontend->>Agora: Join Video Channel
    Agora-->>Frontend: Connection Established
    
    Frontend->>Frontend: Create Camera + Mic Tracks
    Frontend->>Agora: Publish Video/Audio
    Agora-->>Frontend: Streaming Active
    
    Frontend->>Recruiter: Display Question 1
    Recruiter->>Frontend: Submit Answer
    
    Frontend->>Backend: POST /api/interview/analyze-answer
    Backend->>AI: Analyze Response
    AI-->>Backend: {scores, suggestions}
    Backend-->>Frontend: Real-time Scores
    
    Frontend->>Recruiter: Display Scores + Next Question
    
    Note over Recruiter,Frontend: Repeat for all questions
    
    Recruiter->>Frontend: Click "End Interview"
    Frontend->>Backend: POST /api/interview/save
    Backend->>DB: Save Interview Data
    
    Frontend->>Agora: Leave Channel
    Frontend->>Frontend: Close Video/Audio Tracks
```

---

## 3. Agora Token Generation Flow

```mermaid
flowchart TD
    A[Client Requests Token] --> B{Token Type?}
    
    B -->|RTC Token| C[POST /api/agora/token]
    B -->|Chat Token| D[POST /api/agora/chat/token]
    
    C --> E[Load Agora Credentials]
    E --> F[AGORA_APP_ID]
    E --> G[AGORA_APP_CERTIFICATE]
    
    F --> H[RtcTokenBuilder]
    G --> H
    
    H --> I[Set Channel Name]
    H --> J[Set UID]
    H --> K[Set Role: PUBLISHER]
    H --> L[Set Expiry: 1 hour]
    
    I --> M[Build Token]
    J --> M
    K --> M
    L --> M
    
    M --> N{Token Valid?}
    N -->|Yes| O[Return Token + AppId]
    N -->|No| P[Return Error]
    
    O --> Q[Client Joins Channel]
    Q --> R[Agora Validates Token]
    R --> S[Connection Established]
```

---

## 4. Complete System Architecture

```mermaid
graph TB
    subgraph "Frontend - React"
        A[Landing Page]
        B[Resume Upload]
        C[Voice Chat]
        D[Live Interview]
        E[Analytics]
        F[Outreach]
    end
    
    subgraph "Backend - Node.js/Express"
        G[API Server]
        H[Resume Parser]
        I[Agora Service]
        J[AI Service]
        K[Email Service]
    end
    
    subgraph "External Services"
        L[Agora RTC]
        M[Agora Chat]
        N[OpenAI API]
        O[Gmail API]
    end
    
    subgraph "Data Storage"
        P[(Resume Database<br/>resumes.json)]
        Q[(Interview Records)]
    end
    
    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H
    G --> I
    G --> J
    G --> K
    
    I --> L
    I --> M
    J --> N
    K --> O
    
    H --> P
    G --> P
    G --> Q
    
    style L fill:#ff6b6b
    style M fill:#ff6b6b
    style N fill:#4ecdc4
    style O fill:#45b7d1
```

---

## 5. Voice Chat Component Architecture

```mermaid
flowchart LR
    subgraph "VoiceChat Component"
        A[User Interface]
        B[Agora RTC Client]
        C[Web Speech API]
        D[Audio Track]
    end
    
    subgraph "Backend API"
        E[Token Generator]
        F[Chat Handler]
        G[OpenAI Integration]
    end
    
    subgraph "Agora Cloud"
        H[RTC Channel]
        I[Audio Streaming]
    end
    
    A -->|Request Token| E
    E -->|Return Token| A
    
    A -->|Join Channel| B
    B -->|Connect| H
    
    A -->|Start Listening| C
    C -->|Speech-to-Text| A
    
    A -->|Send Query| F
    F -->|Process| G
    G -->|Response| F
    F -->|Return| A
    
    B -->|Publish| D
    D -->|Stream| I
    I -->|Broadcast| H
```

---

## 6. Live Interview Component Architecture

```mermaid
flowchart TB
    subgraph "LiveInterview Component"
        A[Candidate Selection]
        B[Question Generator]
        C[Video Interface]
        D[Real-time Scoring]
        E[Transcript Panel]
    end
    
    subgraph "Agora Integration"
        F[RTC Client]
        G[Video Track]
        H[Audio Track]
        I[Channel Management]
    end
    
    subgraph "AI Processing"
        J[Question Generation]
        K[Answer Analysis]
        L[Score Calculation]
        M[Suggestion Engine]
    end
    
    A --> B
    B --> J
    J --> C
    
    C --> F
    F --> I
    F --> G
    F --> H
    
    C --> E
    E --> K
    K --> L
    L --> D
    L --> M
    M --> C
    
    style F fill:#ff6b6b
    style G fill:#ff6b6b
    style H fill:#ff6b6b
    style I fill:#ff6b6b
```

---

## 7. Data Flow Architecture

```mermaid
flowchart TD
    A[Resume Upload] --> B{File Type?}
    B -->|PDF| C[PDF Parser]
    B -->|DOCX| D[DOCX Parser]
    B -->|TXT| E[Text Parser]
    B -->|URL| F[Download & Parse]
    
    C --> G[Extract Data]
    D --> G
    E --> G
    F --> G
    
    G --> H[Structure Data]
    H --> I{Data Fields}
    
    I --> J[Name]
    I --> K[Email]
    I --> L[Skills]
    I --> M[Experience]
    I --> N[Education]
    
    J --> O[Save to Database]
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[(resumes.json)]
    
    P --> Q[Voice Chat Query]
    P --> R[Interview Generation]
    P --> S[Analytics]
    P --> T[Ranking]
    P --> U[Outreach]
```

---

## 8. End-to-End User Journey

```mermaid
journey
    title Recruiter Journey with TalentVoice
    section Upload
      Upload Resumes: 5: Recruiter
      AI Parses Data: 5: System
      Data Stored: 5: System
    section Screen
      Start Voice Chat: 5: Recruiter
      Ask Questions: 4: Recruiter
      Get AI Responses: 5: System
      Review Candidates: 4: Recruiter
    section Interview
      Select Candidate: 5: Recruiter
      Start Video Call: 5: System
      AI Generates Questions: 5: System
      Conduct Interview: 4: Recruiter
      Real-time Scoring: 5: System
    section Analyze
      View Insights: 5: Recruiter
      Check Rankings: 4: Recruiter
      Review Analytics: 4: Recruiter
    section Outreach
      Send Emails: 5: Recruiter
      Schedule Interviews: 4: Recruiter
```

---

## 9. Agora RTC Connection States

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting: Request Token
    Connecting --> Connected: Token Valid
    Connecting --> Failed: Token Invalid
    
    Connected --> Publishing: Create Tracks
    Publishing --> Streaming: Publish Success
    
    Streaming --> Paused: Mute/Pause
    Paused --> Streaming: Resume
    
    Streaming --> Disconnecting: Leave Channel
    Paused --> Disconnecting: Leave Channel
    
    Disconnecting --> Disconnected: Cleanup Complete
    Failed --> Disconnected: Retry
    
    Disconnected --> [*]
```

---

## 10. System Component Interaction

```mermaid
graph LR
    subgraph "Client Layer"
        A[React Components]
    end
    
    subgraph "API Layer"
        B[Express Routes]
        C[Middleware]
    end
    
    subgraph "Service Layer"
        D[Resume Parser]
        E[Agora Service]
        F[AI Service]
        G[Email Service]
    end
    
    subgraph "External APIs"
        H[Agora RTC/Chat]
        I[OpenAI]
        J[Gmail]
    end
    
    subgraph "Data Layer"
        K[(JSON Database)]
    end
    
    A <-->|HTTP/WebSocket| B
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    
    E <-->|SDK| H
    F <-->|API| I
    G <-->|API| J
    
    D --> K
    B --> K
```

---

## Usage in Presentations

These diagrams can be rendered in:
- **GitHub**: Automatically renders Mermaid
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Online**: https://mermaid.live/
- **PowerPoint**: Export as PNG/SVG from mermaid.live

Copy any diagram code and paste into mermaid.live for instant visualization!
