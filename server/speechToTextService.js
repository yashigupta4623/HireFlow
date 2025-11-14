const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transcribe audio to text using OpenAI Whisper
 */
async function transcribeAudio(audioFilePath) {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
      language: "en"
    });

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Transcribe audio buffer to text
 */
async function transcribeAudioBuffer(audioBuffer, filename = 'audio.webm') {
  try {
    // Save buffer to temp file
    const tempPath = `uploads/temp-${Date.now()}-${filename}`;
    fs.writeFileSync(tempPath, audioBuffer);

    // Transcribe
    const text = await transcribeAudio(tempPath);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    return text;
  } catch (error) {
    console.error('Transcription buffer error:', error);
    throw new Error('Failed to transcribe audio buffer');
  }
}

module.exports = {
  transcribeAudio,
  transcribeAudioBuffer
};
