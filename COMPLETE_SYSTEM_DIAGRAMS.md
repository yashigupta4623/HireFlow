# 🎯 TalentVoice - Complete System Diagrams

## 1. Complete System Architecture

```mermaid
graph TB
    subgraph "Frontend Features"
        A[📤 Upload Center]
        B[📊 Candidate Ranking]
        C[🧠 AI Insights]
        D[🎥 Live Interview]
        E[💬 AI Chat]
        F[🎤 Voice Chat]
        G[📧 Email Outreach]
        H[📈 Dashboard]
        I[🔗 Integrations]
    end
    
    subgraph "Backend Services"
        J[Resume Parser]
        K[Agora RTC Service]
        L[OpenAI Service]
        M[Email Service]
        N[Analytics Engine]
        O[Ranking Algorithm]
    end
    
    subgraph "External APIs"
        P[Agora RTC/Chat]
        Q[OpenAI GPT-4]
        R[Gmail API]
    end
    
    subgraph "Data Layer"
        S[(Resume Database)]
        T[(Interview Records)]
        U[(Analytics Data)]
    end
    
    A --> J
    B --> O
    C --> L
    D --> K
    E --> L
    F --> K
    G --> M
    H --> N
    I --> M
    
    J --> S
    K --> P
    L --> Q
    M --> R
    N --> U
    O --> S
    
    K --> T
    L --> S
    
    style P fill:#ff6b6b
    style Q fill:#4ecdc4
    style R fill:#45b7d1
```

---

## 2. Feature Flow - Complete User Journey

```mermaid
flowchart TD
    Start([Recruiter Logs In]) --> A[📤 Upload Center]
    
    A --> A1[Upload Resume PDF/DOCX]
    A --> A2[Upload via Google Drive Link]
    A --> A3[Bulk Upload Multiple Files]
    
    A1 --> Parse[AI Parses Resume]
    A2 --> Parse
    A3 --> Parse
    
    Parse --> DB[(Resume Database)]
    
    DB --> B[📊 Candidate Ranking]
    B --> B1[Rank by Experience]
    B --> B2[Rank by Skills Match]
    B --> B3[Rank by Activity Score]
    
    DB --> C[🧠 AI Insights]
    C --> C1[Psychological Profile]
    C --> C2[Culture Fit Score]
    C --> C3[Leadership Potential]
    
    DB --> E[💬 AI Chat]
    E --> E1[Text-based Queries]
    E1 --> E2[Get Instant Answers]
    
    DB --> F[🎤 Voice Chat]
    F --> F1[Hands-free Screening]
    F1 --> F2[Voice Responses]
    
    B --> D[🎥 Live Interview]
    C --> D
    
    D --> D1[Video Call via Agora]
    D1 --> D2[Real-time AI Scoring]
    D2 --> D3[Interview Transcript]
    
    D3 --> G[📧 Email Outreach]
    B --> G
    
    G --> G1[Send Interview Invites]
    G --> G2[Bulk Email Campaigns]
    G --> G3[Automated Follow-ups]
    
    B --> H[📈 Dashboard]
    C --> H
    D --> H
    
    H --> H1[View Analytics]
    H --> H2[Track Metrics]
    H --> H3[Generate Reports]
    
    G --> I[🔗 Integrations]
    I --> I1[Career Page Widget]
    I --> I2[API Access]
    I --> I3[Webhook Notifications]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#ffebee
    style E fill:#e8f5e9
    style F fill:#fff9c4
    style G fill:#fce4ec
    style H fill:#e0f2f1
    style I fill:#f1f8e9
```

---

## 3. Upload Center - Detailed Flow

```mermaid
sequenceDiagram
    participant User as Recruiter
    participant UI as Upload Center
    participant API as Backend API
    participant Parser as Resume Parser
    participant AI as OpenAI
    participant DB as Database

    User->>UI: Select Resume File
    UI->>UI: Validate File Type
    UI->>API: POST /api/upload
    
    API->>Parser: Parse Resume
    Parser->>Parser: Extract Text
    Parser->>Parser: Identify Sections
    
    Parser->>AI: Analyze Content
    AI-->>Parser: Structured Data
    
    Parser->>Parser: Extract Skills
    Parser->>Parser: Calculate Experience
    Parser->>Parser: Parse Education
    
    Parser-->>API: Resume Data
    API->>DB: Save Resume
    DB-->>API: Success
    
    API-->>UI: Upload Complete
    UI-->>User: Show Success + Preview
```

---

## 4. Candidate Ranking System

```mermaid
flowchart LR
    subgraph "Input Data"
        A[Resume Database]
        B[Job Description]
    end
    
    subgraph "Ranking Algorithms"
        C[Experience Score]
        D[Skills Match Score]
        E[Education Score]
        F[Activity Score]
        G[Internship Score]
    end
    
    subgraph "Scoring Weights"
        H[Experience: 40%]
        I[Skills: 30%]
        J[Education: 15%]
        K[Activity: 10%]
        L[Internships: 5%]
    end
    
    subgraph "Output"
        M[Ranked Candidate List]
        N[Top 10 Candidates]
        O[Detailed Scores]
    end
    
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    
    B --> D
    
    C --> H
    D --> I
    E --> J
    F --> K
    G --> L
    
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N
    M --> O
```

---

## 5. AI Insights Generation

```mermaid
flowchart TD
    A[Select Candidate] --> B{Insights Exist?}
    
    B -->|Yes| C[Return Cached Insights]
    B -->|No| D[Generate New Insights]
    
    D --> E[Analyze Resume Data]
    E --> F[Skills Analysis]
    E --> G[Experience Analysis]
    E --> H[Education Analysis]
    
    F --> I[OpenAI Processing]
    G --> I
    H --> I
    
    I --> J[Generate Insights]
    
    J --> K[Culture Fit Score 1-10]
    J --> L[Technical Strength 1-10]
    J --> M[Leadership Potential 1-10]
    J --> N[Communication Style]
    J --> O[Career Trajectory]
    J --> P[Strengths Array]
    J --> Q[Weaknesses Array]
    J --> R[Unique Qualities]
    
    K --> S[Save to Database]
    L --> S
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S
    
    S --> T[Display Insights]
    C --> T
```

---

## 6. Live Interview - Complete Flow

```mermaid
sequenceDiagram
    participant R as Recruiter
    participant UI as Interview UI
    participant API as Backend
    participant Agora as Agora RTC
    participant AI as OpenAI
    participant DB as Database

    R->>UI: Select Candidate
    R->>UI: Click "Start Interview"
    
    UI->>API: Generate Questions
    API->>DB: Fetch Resume
    API->>AI: Create Personalized Questions
    AI-->>API: 5-7 Questions
    API-->>UI: Questions Ready
    
    UI->>API: Request Agora Token
    API-->>UI: Token + AppId
    
    UI->>Agora: Join Video Channel
    Agora-->>UI: Connected
    
    UI->>UI: Create Video/Audio Tracks
    UI->>Agora: Publish Streams
    
    loop For Each Question
        UI->>R: Display Question
        R->>UI: Submit Answer
        
        UI->>API: Analyze Answer
        API->>AI: Score Response
        AI-->>API: Scores + Suggestions
        API-->>UI: Real-time Feedback
        
        UI->>R: Show Scores
        UI->>R: Show AI Suggestions
    end
    
    R->>UI: End Interview
    UI->>API: Save Interview Data
    API->>DB: Store Transcript + Scores
    
    UI->>Agora: Leave Channel
    UI->>UI: Close Tracks
```

---

## 7. AI Chat vs Voice Chat

```mermaid
graph TB
    subgraph "💬 AI Chat (Text)"
        A1[Type Question]
        A2[Send to Backend]
        A3[OpenAI Processing]
        A4[Text Response]
        A5[Display in Chat]
    end
    
    subgraph "🎤 Voice Chat (Agora)"
        B1[Speak Question]
        B2[Web Speech API]
        B3[Text Conversion]
        B4[Send to Backend]
        B5[OpenAI Processing]
        B6[Text Response]
        B7[Text-to-Speech]
        B8[Audio Playback]
    end
    
    subgraph "Backend Processing"
        C1[Resume Database]
        C2[Context Builder]
        C3[OpenAI API]
        C4[Response Generator]
    end
    
    A1 --> A2
    A2 --> C2
    
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> C2
    
    C2 --> C1
    C1 --> C3
    C3 --> C4
    
    C4 --> A4
    A4 --> A5
    
    C4 --> B6
    B6 --> B7
    B7 --> B8
    
    style A1 fill:#e8f5e9
    style B1 fill:#fff9c4
```

---

## 8. Email Outreach System

```mermaid
flowchart TD
    A[📧 Email Outreach] --> B{Outreach Type?}
    
    B -->|Single| C[Select Candidate]
    B -->|Bulk| D[Search Candidates]
    
    C --> E[Compose Email]
    D --> F[Select Multiple]
    F --> G[Create Template]
    
    E --> H[Personalize Content]
    G --> I[Add Variables]
    I --> J[name, skills, etc.]
    
    H --> K[Gmail API]
    J --> K
    
    K --> L{Email Service?}
    
    L -->|Gmail| M[Send via Gmail]
    L -->|SendGrid| N[Send via SendGrid]
    
    M --> O[Track Delivery]
    N --> O
    
    O --> P[Update Database]
    P --> Q[Show Success]
    
    Q --> R[📈 Dashboard]
    R --> S[Track Email Metrics]
```

---

## 9. Dashboard Analytics

```mermaid
graph LR
    subgraph "Data Sources"
        A[Resume Database]
        B[Interview Records]
        C[Email Logs]
        D[User Activity]
    end
    
    subgraph "Analytics Engine"
        E[Data Aggregation]
        F[Metric Calculation]
        G[Trend Analysis]
    end
    
    subgraph "Dashboard Widgets"
        H[Total Resumes]
        I[Interviews Conducted]
        J[Top Skills]
        K[Avg Experience]
        L[Email Success Rate]
        M[Activity Timeline]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
```

---

## 10. Integration System

```mermaid
flowchart TB
    A[🔗 Integrations] --> B[Career Page Widget]
    A --> C[API Access]
    A --> D[Webhooks]
    
    B --> B1[Generate Embed Code]
    B1 --> B2[Copy to Website]
    B2 --> B3[Candidates Apply]
    B3 --> B4[Auto-Import to System]
    
    C --> C1[Generate API Key]
    C1 --> C2[API Documentation]
    C2 --> C3[Third-party Integration]
    
    D --> D1[Configure Webhook URL]
    D1 --> D2[Select Events]
    D2 --> D3[New Application]
    D2 --> D4[Interview Complete]
    D2 --> D5[Candidate Ranked]
    
    D3 --> D6[POST to Webhook]
    D4 --> D6
    D5 --> D6
```

---

## 11. Complete Data Flow

```mermaid
flowchart TD
    Start([Resume Upload]) --> Parse[Parse Resume]
    
    Parse --> DB[(Central Database)]
    
    DB --> Feature1[📊 Ranking]
    DB --> Feature2[🧠 Insights]
    DB --> Feature3[💬 AI Chat]
    DB --> Feature4[🎤 Voice Chat]
    DB --> Feature5[🎥 Interview]
    
    Feature1 --> Dashboard[📈 Dashboard]
    Feature2 --> Dashboard
    Feature5 --> Dashboard
    
    Feature1 --> Outreach[📧 Outreach]
    Feature2 --> Outreach
    
    Dashboard --> Analytics[Analytics Data]
    Outreach --> EmailLogs[Email Logs]
    Feature5 --> InterviewData[Interview Records]
    
    Analytics --> Reports[📊 Reports]
    EmailLogs --> Reports
    InterviewData --> Reports
    
    Reports --> Export[Export/Share]
```

---

## 12. Technology Stack

```mermaid
graph TB
    subgraph "Frontend Stack"
        A[React 18]
        B[Vite]
        C[Axios]
        D[Agora RTC SDK]
    end
    
    subgraph "Backend Stack"
        E[Node.js]
        F[Express.js]
        G[Multer]
        H[PDF-Parse]
    end
    
    subgraph "AI & Communication"
        I[OpenAI GPT-4]
        J[Agora RTC]
        K[Agora Chat]
        L[Web Speech API]
    end
    
    subgraph "Services"
        M[Gmail API]
        N[SendGrid]
        O[Google Drive API]
    end
    
    subgraph "Data Storage"
        P[JSON Database]
        Q[File System]
    end
    
    A --> E
    B --> A
    C --> A
    D --> A
    
    E --> F
    F --> G
    F --> H
    
    F --> I
    F --> J
    F --> K
    A --> L
    
    F --> M
    F --> N
    F --> O
    
    F --> P
    G --> Q
```

---

## 13. Feature Interaction Map

```mermaid
mindmap
  root((TalentVoice))
    Upload Center
      PDF Upload
      DOCX Upload
      Google Drive
      Bulk Upload
    Candidate Ranking
      Experience Score
      Skills Match
      Activity Score
      Multi-dimensional
    AI Insights
      Culture Fit
      Technical Strength
      Leadership
      Psychology Profile
    Live Interview
      Video Call
      Real-time Scoring
      AI Questions
      Transcript
    AI Chat
      Text Queries
      Instant Answers
      Context Aware
    Voice Chat
      Hands-free
      Speech-to-Text
      Text-to-Speech
      Agora RTC
    Email Outreach
      Single Email
      Bulk Campaign
      Templates
      Gmail Integration
    Dashboard
      Analytics
      Metrics
      Reports
      Visualizations
    Integrations
      Career Widget
      API Access
      Webhooks
      Third-party
```

---

## 14. Agora Implementation Layers

```mermaid
graph TB
    subgraph "Application Layer"
        A[Voice Chat Component]
        B[Live Interview Component]
    end
    
    subgraph "Agora SDK Layer"
        C[agora-rtc-sdk-ng]
        D[RTC Client]
        E[Audio Track]
        F[Video Track]
    end
    
    subgraph "Backend Layer"
        G[Token Generator]
        H[Channel Manager]
        I[Security Layer]
    end
    
    subgraph "Agora Cloud"
        J[RTC Servers]
        K[Chat Servers]
        L[CDN Network]
    end
    
    A --> C
    B --> C
    
    C --> D
    D --> E
    D --> F
    
    A --> G
    B --> G
    
    G --> H
    H --> I
    
    D --> J
    E --> J
    F --> J
    
    style J fill:#ff6b6b
    style K fill:#ff6b6b
    style L fill:#ff6b6b
```

---

## 15. Security & Performance

```mermaid
flowchart LR
    subgraph "Security Layers"
        A[Input Validation]
        B[Token Authentication]
        C[Rate Limiting]
        D[Data Encryption]
    end
    
    subgraph "Performance Optimization"
        E[Caching]
        F[Lazy Loading]
        G[Code Splitting]
        H[CDN Delivery]
    end
    
    subgraph "Monitoring"
        I[Error Tracking]
        J[Performance Metrics]
        K[User Analytics]
    end
    
    A --> E
    B --> E
    C --> F
    D --> G
    
    E --> I
    F --> J
    G --> K
    H --> K
```

---

## Usage Instructions

### For PowerPoint Presentations:
1. Visit https://mermaid.live/
2. Copy any diagram code
3. Paste and render
4. Download as PNG/SVG
5. Insert into slides

### For Documentation:
- GitHub automatically renders Mermaid
- VS Code: Install "Markdown Preview Mermaid Support"
- Notion: Use Mermaid blocks

### For Reports:
- Export high-resolution images
- Use SVG for scalability
- Customize colors in mermaid.live

All diagrams are production-ready and presentation-optimized! 🚀
