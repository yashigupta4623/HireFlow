# 📧 Email Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Generate password for "Mail"
3. Copy the 16-character code

### Step 2: Configure .env

```bash
# Add to your .env file
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Step 3: Test It

```bash
# Start the server
npm run server

# In another terminal, test email
npm run test-email your-test-email@gmail.com
```

That's it! ✅

---

## 📝 What You Can Do

Once configured, your app can:

- ✉️ Send outreach emails to candidates
- 📨 Bulk email campaigns
- 📅 Interview invitations
- 🔔 Automated notifications
- 📊 Status updates

---

## 🔍 Troubleshooting

### "Invalid login" error?
→ Use App Password, not regular password

### Need 2FA first?
→ Enable at https://myaccount.google.com/security

### Still not working?
→ Check full guide: `GMAIL_SETUP_GUIDE.md`

---

## 🎯 Alternative Options

**Don't want to use Gmail?**

- **SendGrid**: 100 free emails/day
- **Custom SMTP**: Use any email provider

See `GMAIL_SETUP_GUIDE.md` for details.

---

## 📚 Resources

- Full Setup Guide: `GMAIL_SETUP_GUIDE.md`
- Test Script: `node test-email.js`
- API Endpoint: `POST /api/test-email`

---

**Need help?** Check the server logs for detailed error messages.
