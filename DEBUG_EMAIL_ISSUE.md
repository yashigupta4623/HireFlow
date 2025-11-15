# Debug Email Issue - Step by Step

## Current Situation
- ✅ Email exists in `resumes.json` (verified: vinayyadavfzd29@gmail.com)
- ❌ Email showing as "No email available" in frontend modal
- ❌ Warning message appearing

## Debug Steps

### Step 1: Restart the Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 2: Re-upload Job Description
1. Go to Upload Center → Job Description tab
2. Paste your JD
3. Click "Save Job Description"

### Step 3: Check Server Console
You should see logs like:
```
Evaluated Vinay Yadav Delhi: email=vinayyadavfzd29@gmail.com, phone=9721859946
Evaluated Yashi Gupta Delhi: email=yashig406@gmail.com, phone=undefined
Evaluated Rishabh Jain: email=rarishabhjain@gmail.com, phone=7065359624
Evaluated Sushant Verma: email=vermasushant041@gmail.com, phone=7906744723

Sending candidates to frontend:
  - Vinay Yadav Delhi: email=vinayyadavfzd29@gmail.com, phone=9721859946
  - Yashi Gupta Delhi: email=yashig406@gmail.com, phone=undefined
  - Rishabh Jain: email=rarishabhjain@gmail.com, phone=7065359624
  - Sushant Verma: email=vermasushant041@gmail.com, phone=7906744723
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Click on "Vinay Yadav Delhi"
4. You should see:
```
Opening modal for candidate: {...}
Candidate email: vinayyadavfzd29@gmail.com
Full candidate object: {
  "name": "Vinay Yadav Delhi",
  "email": "vinayyadavfzd29@gmail.com",
  "phone": "9721859946",
  ...
}
```

### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Find the `/api/job-description` request
3. Click on it → Response tab
4. Look for `topCandidates` array
5. Verify each candidate has `email` field

Example response:
```json
{
  "success": true,
  "message": "Job description saved and candidates evaluated",
  "topCandidates": [
    {
      "name": "Vinay Yadav Delhi",
      "fitScore": 90,
      "email": "vinayyadavfzd29@gmail.com",
      "phone": "9721859946",
      ...
    }
  ]
}
```

### Step 6: Test Email Modal
1. Click on any candidate
2. Click "Contact Candidate"
3. Modal should show:
   - ✅ `To: vinayyadavfzd29@gmail.com`
   - ✅ No warning message
   - ✅ "Yes, Send Email" button enabled

## If Email Still Not Showing

### Check 1: Verify resumes.json Structure
```bash
node test-candidate-email.js
```

Should show all emails correctly.

### Check 2: Clear Browser Cache
```
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shift + Delete (Mac)
```
Select "Cached images and files" and clear.

### Check 3: Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Check 4: Verify Backend Code

**File: `server/fitScoring.js` line 120-135**
```javascript
return {
  ...candidate,  // This should preserve email field
  fitScore: fitScore.score,
  fitExplanation: fitScore.explanation,
  strengths: fitScore.strengths,
  gaps: fitScore.gaps
};
```

**File: `server/index.js` line 280-295**
```javascript
topCandidates: evaluatedCandidates.map(c => ({
  name: c.name,
  fitScore: c.fitScore,
  fitExplanation: c.fitExplanation,
  strengths: c.strengths,
  gaps: c.gaps,
  skills: c.skills,
  education: c.education,
  yearsOfExperience: c.yearsOfExperience,
  experience: c.experience,
  email: c.email,        // ← Should be here
  phone: c.phone,
  location: c.location
}))
```

### Check 5: Verify Frontend Code

**File: `client/src/components/ResumeUpload.jsx` line 150-180**
```javascript
const handleSendEmail = async () => {
  if (!selectedCandidate.email) {
    alert('No email address available for this candidate');
    return;
  }
  // ... rest of code
}
```

## Common Issues & Solutions

### Issue 1: Old Data Cached
**Solution**: Re-upload JD to fetch fresh data

### Issue 2: Server Not Restarted
**Solution**: Restart with `npm run dev`

### Issue 3: Browser Cache
**Solution**: Hard refresh or clear cache

### Issue 4: Wrong Field Name
**Verify**: Field is `email` not `Email` or `emailAddress`

### Issue 5: Data Not Spreading Correctly
**Check**: `...candidate` in fitScoring.js preserves all fields

## Expected Flow

1. **Upload JD** → Backend reads `resumes.json`
2. **fitScoring.evaluateAllCandidates()** → Adds fitScore, preserves email
3. **Backend response** → Includes email in topCandidates
4. **Frontend receives** → Stores in topCandidates state
5. **Click candidate** → Opens modal with selectedCandidate
6. **selectedCandidate.email** → Should have email value
7. **Confirmation modal** → Shows email address
8. **Send email** → Uses email to send

## Test Email Sending

Once email shows correctly:

1. Click "Yes, Send Email"
2. Check server console for:
```
Email sent successfully!
Preview URL: https://ethereal.email/message/...
```
3. Open preview URL to see email
4. Or check actual inbox if email service configured

## Email Service Configuration

Add to `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Or use test account (automatic fallback).

## Quick Verification Script

Run this to verify everything:
```bash
# 1. Check data
node test-candidate-email.js

# 2. Restart server
npm run dev

# 3. In browser:
# - Upload JD
# - Check console logs
# - Click candidate
# - Verify email shows
```

## Still Not Working?

If after all steps email still doesn't show:

1. **Take screenshot** of:
   - Server console logs
   - Browser console logs
   - Network tab response
   - Modal showing "No email available"

2. **Check these files** were updated:
   - `server/fitScoring.js` (has debug logging)
   - `server/index.js` (has debug logging)
   - `client/src/components/ResumeUpload.jsx` (has console.log)

3. **Verify** the changes were saved and server restarted

4. **Try** with a different candidate (Rishabh Jain, Sushant Verma)

---

## Success Indicators

✅ Server logs show: `email=vinayyadavfzd29@gmail.com`
✅ Browser console shows: `Candidate email: vinayyadavfzd29@gmail.com`
✅ Network response includes: `"email": "vinayyadavfzd29@gmail.com"`
✅ Modal shows: `To: vinayyadavfzd29@gmail.com`
✅ No warning message appears
✅ "Yes, Send Email" button is enabled
✅ Email sends successfully

---

**Next Action**: Restart server and re-upload JD, then check logs!
