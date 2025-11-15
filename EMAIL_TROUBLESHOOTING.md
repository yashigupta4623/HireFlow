# Email Functionality Troubleshooting

## Issue: "No email available" showing in confirmation modal

### Root Cause
The candidate data was loaded before the backend was updated to include email fields. The frontend is showing cached data.

### Verified Data
✅ All resumes in `resumes.json` have email addresses:
- Rishabh Jain: rarishabhjain@gmail.com
- Yashi Gupta: yashig406@gmail.com
- Sushant Verma: vermasushant041@gmail.com
- Vinay Yadav: vinayyadavfzd29@gmail.com

### Solution: Refresh the Data

#### Option 1: Re-upload the Job Description (Recommended)
1. Go to Upload Center → Job Description tab
2. Paste the JD again
3. Click "Save Job Description"
4. The candidates list will refresh with complete data including emails
5. Click on any candidate → "Contact Candidate"
6. Email should now show correctly

#### Option 2: Hard Refresh the Browser
1. Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. This clears the cache and reloads the page
3. Re-upload the JD
4. Try again

#### Option 3: Restart the Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### How to Verify It's Working

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Click on a candidate
   - You should see logs like:
     ```
     Opening modal for candidate: {...}
     Candidate email: rarishabhjain@gmail.com
     Full candidate object: { ... email: "rarishabhjain@gmail.com" ... }
     ```

2. **Check Email Confirmation Modal**:
   - Should show: `To: rarishabhjain@gmail.com`
   - NOT: `To: No email available`
   - "Yes, Send Email" button should be enabled (not grayed out)

3. **Test Email Sending**:
   - Click "Yes, Send Email"
   - Should show: "⏳ Sending..."
   - Then: "✅ Email sent successfully!"

### Backend Verification

The backend endpoint `/api/job-description` now returns:
```javascript
{
  name: c.name,
  fitScore: c.fitScore,
  fitExplanation: c.fitExplanation,
  strengths: c.strengths,
  gaps: c.gaps,
  skills: c.skills,
  education: c.education,
  yearsOfExperience: c.yearsOfExperience,
  experience: c.experience,
  email: c.email,          // ✅ Now included
  phone: c.phone,          // ✅ Now included
  location: c.location     // ✅ Now included
}
```

### Email Service Configuration

The email will be sent using the configured email service. Check `.env` file:

```env
# Option 1: Gmail with App Password (Easiest)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Option 2: Gmail with OAuth2
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Option 3: SendGrid
SENDGRID_API_KEY=your-sendgrid-key

# Option 4: Custom SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

If no email service is configured, it will use Ethereal (test email service) and show a preview URL in the console.

### Testing Without Email Service

Even without email configuration, you can test the flow:
1. Click "Contact Candidate"
2. Confirmation modal appears
3. Click "Yes, Send Email"
4. Check server console for:
   ```
   Email sent successfully!
   Preview URL: https://ethereal.email/message/...
   ```
5. Open the preview URL to see the email

### Debug Steps

If email still shows as "No email available":

1. **Check Network Tab**:
   - Open DevTools → Network tab
   - Upload JD
   - Find the `/api/job-description` request
   - Click on it → Response tab
   - Verify `topCandidates` array includes `email` field

2. **Check Console Logs**:
   - Should see: `Candidate email: rarishabhjain@gmail.com`
   - If it shows `undefined`, the data isn't being passed correctly

3. **Verify Backend is Running**:
   ```bash
   # Check if server is running on port 3001
   curl http://localhost:3001/api/email-status
   ```

### Expected Email Content

When sent, the email will contain:

**Subject**: Exciting Job Opportunity - 85% Match

**Body**:
```
Dear [Candidate Name],

We came across your profile and believe you would be an excellent fit 
for an exciting opportunity we're currently recruiting for.

Based on our initial assessment, your profile shows a 85% match with 
the role requirements!

JOB DESCRIPTION:
[Full JD text here]

We would love to discuss this opportunity with you further. If you're 
interested, please reply to this email and we'll schedule a time to connect.

Looking forward to hearing from you!

Best regards,
TalentVoice Recruitment Team
```

---

## Quick Fix Checklist

- [ ] Re-upload the Job Description
- [ ] Check browser console for candidate email
- [ ] Verify email shows in confirmation modal
- [ ] Test sending email
- [ ] Check for success message
- [ ] Verify email service is configured (optional)

## Still Not Working?

If the issue persists after trying all solutions:

1. Check `server/index.js` line 280-295 - verify email field is in the response
2. Check `client/src/components/ResumeUpload.jsx` line 150-180 - verify email handling
3. Run: `node test-candidate-email.js` to verify data
4. Check browser console for any errors
5. Check server console for any errors

---

**Status**: Issue identified - cached data without email fields
**Solution**: Re-upload JD to refresh candidate data
**Verification**: Check console logs and confirmation modal
