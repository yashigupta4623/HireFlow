const fs = require('fs');
const path = require('path');

// Initialize Google Cloud TTS client
let ttsClient = null;
let textToSpeechLib = null;

try {
  // Try to load the library
  textToSpeechLib = require('@google-cloud/text-to-speech');
  
  // Try to initialize with credentials if available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    ttsClient = new textToSpeechLib.TextToSpeechClient();
    console.log('Google Cloud TTS initialized successfully');
  } else {
    console.log('Google TTS credentials not found - using browser TTS');
  }
} catch (error) {
  console.log('Google TTS not available - using browser TTS');
}

/**
 * Convert text to speech using Google Cloud TTS
 * Returns audio buffer
 */
async function textToSpeech(text) {
  if (!ttsClient) {
    throw new Error('Google TTS not configured');
  }

  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-F', // Natural female voice
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0
    }
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent;
}

/**
 * Save audio to file and return path
 */
async function textToSpeechFile(text, filename) {
  const audioContent = await textToSpeech(text);
  const outputPath = path.join('uploads', filename);
  fs.writeFileSync(outputPath, audioContent, 'binary');
  return outputPath;
}

module.exports = {
  textToSpeech,
  textToSpeechFile,
  isAvailable: () => ttsClient !== null
};
