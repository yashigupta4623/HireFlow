# 🚀 Quick Start Guide - TalentVoice

## Step 1: Install Dependencies (5 minutes)

```bash
# Install all dependencies for both frontend and backend
npm run install-all
```

This will install:
- Backend: Express, OpenAI, Agora, PDF parsers
- Frontend: React, Vite, Axios, Agora SDK

## Step 2: Configure API Keys (5 minutes)

### Create .env file
```bash
cp .env.example .env
```

### Get Agora Credentials (FREE)
1. Go to https://www.agora.io/
2. Sign up (free account)
3. Click "Create Project"
4. Copy **App ID** and **App Certificate**
5. Paste into `.env`:
```env
AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_certificate_here
```

### Get OpenAI API Key (Optional - has fallback)
1. Go to https://platform.openai.com/
2. Sign up
3. Go to API Keys section
4. Create new key
5. Paste into `.env`:
```env
OPENAI_API_KEY=sk-your_key_here
```

**Note**: If you skip OpenAI, the app still works with local AI fallback!

## Step 3: Run the Application (1 minute)

```bash
npm run dev
```

This starts:
- ✅ Backend server on http://localhost:3001
- ✅ Frontend on http://localhost:3000

## Step 4: Test It Out (3 minutes)

### 4.1 Upload Test Resumes
1. Open http://localhost:3000
2. Click "Upload" tab
3. Create a simple test resume (sample below)
4. Upload it

### 4.2 Try JD Matching
1. Click "JD Match" tab
2. Paste a job description
3. Click "Evaluate Candidates"
4. See AI fit scores!

### 4.3 Chat with AI
1. Click "Chat" tab
2. Try: "Who has Python skills?"
3. Try: "Show candidates with 5+ years experience"

### 4.4 Voice Chat (if Agora configured)
1. Click "Voice" tab
2. Click "Start Voice Chat"
3. Speak your query
4. Hear AI response!

### 4.5 View Analytics
1. Click "Analytics" tab
2. See top skills chart
3. View talent pool insights

---

## Sample Test Resume

Create a file `test_resume.txt`:

```
John Doe
Email: john.doe@email.com
Phone: +1-555-0123

Skills:
Python, JavaScript, React, Node.js, AWS, Docker, SQL, Machine Learning

Experience:
Senior Software Engineer at Tech Corp (2018-2023)
- Built scalable microservices using Node.js and AWS
- Led team of 5 developers
- Implemented ML models for recommendation system

Software Engineer at StartupXYZ (2015-2018)
- Developed React frontend applications
- Worked with Python backend services

Education:
Bachelor of Science in Computer Science
MIT, 2015

5+ years of professional experience in full-stack development.
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules client/node_modules
npm cache clean --force
npm run install-all
```

### Agora Not Working
- Check App ID and Certificate are correct
- Ensure no spaces in .env values
- Try regenerating credentials in Agora dashboard

### OpenAI Errors
- App works without OpenAI (uses local fallback)
- Check API key is valid
- Ensure you have credits in OpenAI account

---

## What's Next?

### For Demo/Presentation
1. Upload 5-10 diverse resumes
2. Create a realistic job description
3. Practice the demo flow (see PROJECT_SUMMARY.md)
4. Record a 3-minute video

### For Development
1. Add more resume formats (LinkedIn, JSON)
2. Implement vector search for better matching
3. Add email integration for outreach
4. Build mobile app

### For Production
1. Add database (MongoDB/PostgreSQL)
2. Implement user authentication
3. Deploy to cloud (Vercel + Railway)
4. Add rate limiting and security

---

## Need Help?

- **Full Documentation**: See HACKATHON_DOCS.md
- **Project Summary**: See PROJECT_SUMMARY.md
- **Technical Details**: See README.md

---

**Total Setup Time**: ~15 minutes
**Demo Ready**: Immediately after setup!

🎉 You're all set! Start uploading resumes and experience the future of recruitment.
