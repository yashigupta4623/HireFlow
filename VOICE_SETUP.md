# Human-Like Voice Setup

Your app currently uses browser voices. For truly human-like voice, follow these steps:

## Option 1: Google Cloud Text-to-Speech (Recommended)

### Setup:
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Cloud Text-to-Speech API"
4. Create a service account key:
   - Go to "IAM & Admin" > "Service Accounts"
   - Create service account
   - Grant "Cloud Text-to-Speech User" role
   - Create JSON key
5. Download the JSON key file
6. Add to your `.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-key.json
   ```

### Free Tier:
- 1 million characters per month FREE
- Neural2 voices (most natural)

## Option 2: Use Better Browser Voices

### Mac:
- Best voice: "Samantha" (already configured)
- Download more: System Preferences > Accessibility > Spoken Content > System Voice

### Windows:
- Best voice: "Microsoft Zira"
- Download more: Settings > Time & Language > Speech

### Chrome:
- Uses Google voices automatically
- "Google US English Female" is good

## Current Setup:
✅ Browser TTS (works everywhere, sounds robotic)
⏳ Google Cloud TTS (needs setup, sounds human)

The app will automatically use Google TTS if configured, otherwise falls back to browser voices.
