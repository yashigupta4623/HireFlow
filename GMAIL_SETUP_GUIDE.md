# Gmail Setup Guide for Google Cloud

This guide shows you how to send emails from your application using Gmail on Google Cloud.

## 🚀 Quick Setup (Recommended)

### Method 1: Gmail App Password (Easiest)

This is the simplest method and works great for Google Cloud deployments.

**Steps:**

1. **Enable 2-Factor Authentication** on your Google account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it (e.g., "TalentVoice")
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Add to your `.env` file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   (Remove spaces from the app password)

4. **Test it**:
   ```bash
   npm run server
   ```
   You should see: `📧 Email service initialized using: gmail-app-password`

---

## 🔐 Advanced Setup

### Method 2: Gmail OAuth2 (For Production)

Use this for production deployments with service accounts.

**Steps:**

1. **Create a Google Cloud Project**:
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `https://developers.google.com/oauthplayground`
   - Save the Client ID and Client Secret

4. **Get Refresh Token**:
   - Go to https://developers.google.com/oauthplayground
   - Click settings (⚙️) > Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret
   - In Step 1, select "Gmail API v1" > "https://mail.google.com/"
   - Click "Authorize APIs"
   - In Step 2, click "Exchange authorization code for tokens"
   - Copy the "Refresh token"

5. **Add to your `.env` file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REFRESH_TOKEN=your-refresh-token
   ```

---

### Method 3: SendGrid (Alternative)

SendGrid is popular on Google Cloud and offers 100 free emails/day.

**Steps:**

1. **Sign up for SendGrid**:
   - Go to https://sendgrid.com/
   - Create a free account

2. **Verify your sender email**:
   - Go to Settings > Sender Authentication
   - Verify a single sender email

3. **Create API Key**:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Full Access"
   - Copy the API key (starts with `SG.`)

4. **Add to your `.env` file**:
   ```env
   SENDGRID_API_KEY=SG.your-api-key-here
   EMAIL_USER=your-verified-sender@yourdomain.com
   ```

---

## 📧 Testing Email Service

### Test via API

```bash
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "This is a test email from TalentVoice!"
  }'
```

### Test via Outreach Feature

1. Go to http://localhost:3003
2. Navigate to "Outreach" section
3. Search for candidates
4. Click "Send Email" to test

---

## 🔧 Troubleshooting

### "Invalid login" error with Gmail

**Solution**: Make sure you're using an App Password, not your regular Gmail password.

### "Less secure app access" error

**Solution**: Google removed this option. You must use App Passwords with 2FA enabled.

### Emails going to spam

**Solutions**:
- Use a verified domain email (not @gmail.com for production)
- Set up SPF, DKIM, and DMARC records
- Consider using SendGrid or similar service

### Rate limits

Gmail has sending limits:
- Free Gmail: 500 emails/day
- Google Workspace: 2,000 emails/day

For higher volume, use SendGrid or similar service.

---

## 🚀 Deployment on Google Cloud

### Using Cloud Run

Add environment variables in Cloud Run:

```bash
gcloud run deploy talenvoice \
  --set-env-vars EMAIL_USER=your-email@gmail.com \
  --set-env-vars EMAIL_PASS=your-app-password
```

### Using App Engine

Add to `app.yaml`:

```yaml
env_variables:
  EMAIL_USER: "your-email@gmail.com"
  EMAIL_PASS: "your-app-password"
```

### Using Compute Engine

Add to `.env` file on the VM or use Secret Manager:

```bash
# Install Secret Manager
gcloud secrets create email-user --data-file=- <<< "your-email@gmail.com"
gcloud secrets create email-pass --data-file=- <<< "your-app-password"

# Access in your app
gcloud secrets versions access latest --secret="email-user"
```

---

## 📊 Email Features in TalentVoice

Once configured, you can:

1. **Send outreach emails** to candidates
2. **Bulk email campaigns** for job openings
3. **Interview invitations** with calendar links
4. **Automated follow-ups** after interviews
5. **Status updates** to candidates

All accessible through the Outreach section of the app!

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to git
2. **Use App Passwords**, not regular passwords
3. **Rotate credentials** regularly
4. **Use Secret Manager** in production
5. **Monitor usage** for suspicious activity
6. **Enable alerts** for failed login attempts

---

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Google Cloud Secret Manager](https://cloud.google.com/secret-manager)

---

Need help? Check the logs for detailed error messages:
```bash
npm run server
```

Look for: `📧 Email service initialized using: [method]`
