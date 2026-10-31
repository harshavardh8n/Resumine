const { GoogleGenAI } = require('@google/genai');
const { env } = require('./env');

let geminiClient = null;

function getGeminiClient() {
  if (!geminiClient) {
    if (!env.GEMINI_API_KEY) {
      console.warn('⚠️ [Gemini] Warning: GEMINI_API_KEY is not set. AI calls will fail until configured.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY || 'dummy_key_for_initialization',
    });
  }
  return geminiClient;
}

module.exports = {
  getGeminiClient,
};

