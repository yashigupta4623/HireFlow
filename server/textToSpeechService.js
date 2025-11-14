const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Convert text to speech using OpenAI TTS
 * Returns audio buffer that can be streamed to client
 */
async function textToSpeech(text, voice = 'alloy') {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 1.0
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('TTS error:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Save TTS audio to file
 */
async function textToSpeechFile(text, outputPath, voice = 'alloy') {
  const buffer = await textToSpeech(text, voice);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = {
  textToSpeech,
  textToSpeechFile
};
