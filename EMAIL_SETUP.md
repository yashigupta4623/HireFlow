# Email Setup Guide

Your email outreach feature is ready! Follow these steps to send real emails:

## Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "TalentVoice"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # The app password from step 2
```

## Option 2: Test Mode (No Setup Required)

If you don't configure email credentials, the system will use **Ethereal Email** (test mode):
- Emails won't actually be sent
- You'll get preview URLs in the console
- Perfect for testing and demos

## Option 3: Other Email Providers

### Outlook/Hotmail:
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo:
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password  # Generate at Yahoo Account Security
```

## Testing

1. Configure your email in `.env`
2. Restart the server: `npm run dev`
3. Go to "Email Outreach" in the app
4. Select candidates and send test email
5. Check your inbox!

## Current Status

✅ Email service installed (Nodemailer)
✅ Bulk email sending ready
✅ Test mode available (no config needed)
⏳ Configure your email to send real emails

## Troubleshooting

**"Invalid credentials"**
- Make sure you're using an App Password, not your regular password
- Check that 2FA is enabled

**"Less secure app access"**
- Gmail no longer supports this - use App Passwords instead

**Emails going to spam**
- Normal for new senders
- Recipients should mark as "Not Spam"
