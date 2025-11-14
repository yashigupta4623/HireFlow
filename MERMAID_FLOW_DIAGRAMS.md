# TalentVoice - Mermaid Flow Diagrams

Copy these diagrams to [mermaid.live](https://mermaid.live) to visualize them.

## 1. System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Upload] --> API[API Gateway]
        B[JD Match] --> API
        C[Ranking] --> API
        D[Chat] --> API
        E[Voice] --> API
        F[Analytics] --> API
        G[Outreach] --> API
        H[Integration] --> API
    end
    
    subgraph "Backend Services"
        API --> RP[Resume Parser]
        API --> FS[Fit Scoring]
        API --> PA[Profile Analyzer]
        API --> AS[Agora Service]
        API --> CH[Conversation Handler]
        API --> SM[Skill Matrix]
    end
    
    subgraph "External APIs"
        RP --> OAI[OpenAI API]
        FS --> OAI
        CH --> OAI
        PA --> GH[GitHub API]
        PA --> LC[LeetCode API]
        AS --> AG[Agora RTC]
    end
    
    subgraph "Data Storage"
        RP --> DB[(Resume Database)]
        FS --> DB
        PA --> DB
    end
```

## 2. Resume Upload Flow

```mermaid
flowchart TD
    Start([User Uploads Resume]) --> Choice{Upload Type?}
    
    Choice -->|File| Upload[Multer Receives File]
    Choice -->|URL| Download[Download from URL]
    
    Upload --> Save[Save to /uploads/]
    Download --> Save
    
    Save --> Detect[Detect File Type]
    
    Detect --> Extract{File Type?}
    Extract -->|PDF| PDF[pdf-parse]
    Extract -->|DOCX| DOCX[mammoth]
    Extract -->|TXT| TXT[fs.readFile]
    
    PDF --> Parse[Parse with OpenAI]
    DOCX --> Parse
    TXT --> Parse
    
    Parse --> Data[Extract Data:<br/>Name, Email, Skills,<br/>Experience, Education]
    
    Data --> Links[Extract Profile Links:<br/>GitHub, LinkedIn,<br/>LeetCode, etc.]
    
    Links --> Create[Create Resume Object]
    
    Create --> Store[(Store in Database)]
    
    Store --> Success[Return Success Response]
    
    Success --> End([End])
```



## 3. Job Description Matching Flow

```mermaid
flowchart TD
    Start([User Enters JD]) --> Input{Input Type?}
    
    Input -->|Text| Store[Store JD]
    Input -->|URL| Fetch[Fetch from URL]
    
    Fetch --> Parse[Parse HTML/Text]
    Parse --> Store
    
    Store --> Loop[For Each Candidate]
    
    Loop --> Extract[Extract JD Requirements]
    Extract --> Compare[Compare with<br/>Candidate Skills]
    
    Compare --> AI[OpenAI Analysis]
    
    AI --> Score[Calculate Fit Score<br/>0-100%]
    
    Score --> Explain[Generate Explanation]
    Explain --> Strengths[Identify Strengths]
    Strengths --> Gaps[Identify Gaps]
    
    Gaps --> Check{More Candidates?}
    Check -->|Yes| Loop
    Check -->|No| Sort[Sort by Fit Score]
    
    Sort --> Top[Get Top 5 Matches]
    
    Top --> Return[Return Results]
    
    Return --> End([End])
```

## 4. Agora Voice Chat Integration Flow

```mermaid
sequenceDiagram
    participant U as User/Recruiter
    participant VC as VoiceChat Component
    participant BE as Backend Server
    participant AS as Agora Service
    participant AG as Agora Cloud
    
    U->>VC: Click "Start Voice Chat"
    VC->>BE: POST /api/agora/token<br/>{channelName, uid}
    
    BE->>AS: generateToken()
    AS->>AS: Build RTC Token with:<br/>- App ID<br/>- App Certificate<br/>- Channel Name<br/>- UID<br/>- Expiration Time
    
    AS->>BE: Return Token
    BE->>VC: {token, appId}
    
    VC->>VC: Initialize Agora Client<br/>AgoraRTC.createClient()
    
    VC->>AG: Join Channel<br/>client.join(appId, channel, token)
    AG->>VC: Channel Joined
    
    VC->>VC: Create Audio Track<br/>createMicrophoneAudioTrack()
    
    VC->>AG: Publish Audio<br/>client.publish([audioTrack])
    AG->>VC: Audio Published
    
    Note over U,AG: Real-time Voice Communication Active
    
    U->>VC: Click "End Voice Chat"
    VC->>AG: Leave Channel<br/>client.leave()
    VC->>VC: Close Audio Track
    AG->>VC: Disconnected
```



## 5. Candidate Ranking with Profile Activity Flow

```mermaid
flowchart TD
    Start([User Selects Sort Criteria]) --> Fetch[Fetch All Candidates]
    
    Fetch --> Loop[For Each Candidate]
    
    Loop --> Base[Calculate Base Score:<br/>Experience × 10 +<br/>Internships × 5]
    
    Base --> CheckLinks{Has Profile<br/>Links?}
    
    CheckLinks -->|No| Final1[Use Base Score]
    CheckLinks -->|Yes| Analyze[Analyze Profile Activity]
    
    Analyze --> GitHub{Has GitHub?}
    GitHub -->|Yes| GHCheck[Check GitHub Activity:<br/>- Recent commits<br/>- Public repos<br/>- Followers]
    GitHub -->|No| LinkedIn
    
    GHCheck --> GHScore[Calculate GitHub Score<br/>Max 45 points]
    GHScore --> LinkedIn
    
    LinkedIn{Has LinkedIn?}
    LinkedIn -->|Yes| LICheck[Verify Profile<br/>Accessibility]
    LinkedIn -->|No| LeetCode
    
    LICheck --> LIScore[LinkedIn Score<br/>5 points]
    LIScore --> LeetCode
    
    LeetCode{Has LeetCode?}
    LeetCode -->|Yes| LCCheck[Fetch LeetCode Data:<br/>- Problems solved<br/>- Ranking]
    LeetCode -->|No| Total
    
    LCCheck --> LCScore[Calculate LeetCode Score<br/>Max 45 points]
    LCScore --> Total
    
    Total[Total Activity Score] --> Boost[Calculate Boost:<br/>Up to 20% increase]
    
    Boost --> Final2[Final Score =<br/>Base + Boost]
    
    Final1 --> More{More<br/>Candidates?}
    Final2 --> More
    
    More -->|Yes| Loop
    More -->|No| Sort[Sort by Selected Criteria]
    
    Sort --> Display[Display Ranked List with:<br/>- Scores<br/>- Activity Boost<br/>- Profile Links]
    
    Display --> End([End])
```



## 6. Candidate Outreach Email Flow

```mermaid
flowchart TD
    Start([User Opens Outreach]) --> LoadJD{Load JD?}
    
    LoadJD -->|Load Uploaded| FetchJD[Fetch Stored JD<br/>from Database]
    LoadJD -->|Manual Entry| EnterJD[User Enters JD]
    
    FetchJD --> SelectTime[Select Time Range:<br/>1, 3, 6, or 12 months]
    EnterJD --> SelectTime
    
    SelectTime --> Search[Click Search Candidates]
    
    Search --> Filter[Filter Candidates by<br/>Upload Date]
    
    Filter --> Evaluate[Evaluate Filtered<br/>Candidates vs JD]
    
    Evaluate --> Match[Get Matches with<br/>60%+ Fit Score]
    
    Match --> Display[Display Matching<br/>Candidates]
    
    Display --> Select[User Selects<br/>Candidates]
    
    Select --> Template[Auto-generate<br/>Email Template with:<br/>- Subject<br/>- JD Description<br/>- Availability Request]
    
    Template --> Customize[User Customizes<br/>Email if Needed]
    
    Customize --> Send[Click Send Emails]
    
    Send --> Loop[For Each Selected<br/>Candidate]
    
    Loop --> CheckEmail{Has Email?}
    
    CheckEmail -->|No| Skip[Skip Candidate]
    CheckEmail -->|Yes| Personalize[Personalize Email:<br/>Replace {{name}}]
    
    Personalize --> SendEmail[Send Email via<br/>Email Service]
    
    SendEmail --> Count[Increment Sent Count]
    Skip --> More
    Count --> More{More<br/>Candidates?}
    
    More -->|Yes| Loop
    More -->|No| Success[Show Success Message:<br/>X emails sent]
    
    Success --> End([End])
```



## 7. Career Page Integration Flow

```mermaid
flowchart TD
    Start([Company Opens Integration]) --> Enter[Enter Company Details:<br/>- Name<br/>- Career Page URL]
    
    Enter --> GenKey[Generate API Key]
    
    GenKey --> Webhook[Optional: Enter<br/>Webhook URL]
    
    Webhook --> Save[Save Integration<br/>Settings]
    
    Save --> GenCode[Generate Embed Code]
    
    GenCode --> Copy[Copy Embed Code]
    
    Copy --> Paste[Paste Code on<br/>Career Page]
    
    Paste --> Widget[Widget Loads on<br/>Career Page]
    
    Widget --> Candidate([Candidate Visits<br/>Career Page])
    
    Candidate --> Apply[Candidate Applies<br/>via Widget]
    
    Apply --> Submit[POST /api/public/apply<br/>with API Key]
    
    Submit --> Validate{Valid API Key?}
    
    Validate -->|No| Error[Return 401 Error]
    Validate -->|Yes| Process[Process Application]
    
    Process --> ParseResume[Parse Resume Data]
    
    ParseResume --> StoreDB[(Store in Database)]
    
    StoreDB --> CheckWebhook{Webhook<br/>Configured?}
    
    CheckWebhook -->|Yes| SendWebhook[Send Webhook<br/>Notification to Company]
    CheckWebhook -->|No| Response
    
    SendWebhook --> Response[Return Success<br/>Response]
    
    Response --> Notify[Notify Candidate:<br/>Application Received]
    
    Error --> End([End])
    Notify --> End
```



## 8. User Authentication Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> Check{Signed In?}
    
    Check -->|No| SignIn[Show Sign In Page]
    Check -->|Yes| Dashboard[Show Dashboard]
    
    SignIn --> EnterEmail[Enter Email]
    EnterEmail --> EnterPass[Enter Password]
    
    EnterPass --> Submit[Click Sign In]
    
    Submit --> Extract[Extract Username<br/>from Email]
    
    Extract --> SetState[Set User State:<br/>- isSignedIn: true<br/>- username]
    
    SetState --> Dashboard
    
    Dashboard --> UseApp[User Uses App<br/>Features]
    
    UseApp --> SignOut{Click Sign Out?}
    
    SignOut -->|No| UseApp
    SignOut -->|Yes| Clear[Clear User State]
    
    Clear --> SignIn
```

## 9. Chat Interface Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Chat Interface
    participant BE as Backend
    participant AI as OpenAI API
    participant DB as Resume Database
    
    U->>UI: Enter Query
    UI->>UI: Add User Message<br/>to Chat History
    
    UI->>BE: POST /api/chat<br/>{message}
    
    BE->>DB: Fetch Resume Data
    DB->>BE: Return Resumes
    
    BE->>AI: Send Prompt with:<br/>- User Query<br/>- Resume Context<br/>- JD Context
    
    AI->>AI: Process Query<br/>Analyze Data
    
    AI->>BE: Return AI Response
    
    BE->>UI: {response}
    
    UI->>UI: Add AI Message<br/>to Chat History
    
    UI->>U: Display Response
```



## 10. Complete User Journey

```mermaid
graph LR
    A[Sign In] --> B[Upload Resumes]
    B --> C[Upload Job Description]
    C --> D{Choose Action}
    
    D --> E[View JD Matches]
    D --> F[Rank Candidates]
    D --> G[Chat with AI]
    D --> H[Voice Interview]
    D --> I[Send Outreach Emails]
    D --> J[View Analytics]
    D --> K[Setup Integration]
    
    E --> L[Review Top Matches]
    F --> M[Check Profile Activity]
    G --> N[Ask Questions]
    H --> O[Voice Screening]
    I --> P[Email Candidates]
    J --> Q[View Insights]
    K --> R[Embed on Career Page]
    
    L --> S[Make Decision]
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> T[Receive Applications]
    
    S --> U[Hire Candidate]
    T --> B
```

## 11. Data Flow Architecture

```mermaid
graph TD
    subgraph "Input Sources"
        A1[Resume Files]
        A2[Resume URLs]
        A3[Job Descriptions]
        A4[Career Page Applications]
    end
    
    subgraph "Processing Layer"
        B1[File Parser]
        B2[URL Fetcher]
        B3[Text Extractor]
        B4[AI Analyzer]
    end
    
    subgraph "Analysis Layer"
        C1[Fit Scoring]
        C2[Profile Activity]
        C3[Skill Matching]
        C4[Experience Ranking]
    end
    
    subgraph "Storage"
        D1[(Resume Database)]
        D2[(Job Descriptions)]
        D3[(Integration Settings)]
    end
    
    subgraph "Output"
        E1[Ranked Candidates]
        E2[Match Reports]
        E3[Analytics Dashboard]
        E4[Email Campaigns]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B1
    
    B1 --> B4
    B2 --> B4
    B3 --> B4
    
    B4 --> D1
    B4 --> D2
    
    D1 --> C1
    D1 --> C2
    D1 --> C3
    D1 --> C4
    D2 --> C1
    
    C1 --> E1
    C2 --> E1
    C3 --> E2
    C4 --> E1
    
    E1 --> E3
    E2 --> E3
    E1 --> E4
```

---

## How to Use These Diagrams

1. **Copy any diagram code** (including the triple backticks and `mermaid` keyword)
2. **Go to** [mermaid.live](https://mermaid.live)
3. **Paste the code** in the editor
4. **View the rendered diagram** on the right side
5. **Export** as PNG, SVG, or share the link

## Diagram Types Used

- **flowchart TD/LR**: Top-Down or Left-Right flowcharts
- **graph TB/LR**: Graph diagrams
- **sequenceDiagram**: Sequence/interaction diagrams

## Color Customization

You can add themes by adding this at the top of any diagram:

```mermaid
%%{init: {'theme':'dark'}}%%
```

Or use: `'theme':'forest'`, `'theme':'neutral'`, `'theme':'base'`

---

**Created for**: TalentVoice AI Recruitment Platform  
**Last Updated**: November 2024
