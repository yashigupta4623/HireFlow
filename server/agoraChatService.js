const axios = require('axios');

const AGORA_CHAT_API_BASE = 'https://a41.chat.agora.io';
const APP_KEY = process.env.AGORA_CHAT_APP_KEY;
const ORG_NAME = process.env.AGORA_CHAT_ORG_NAME;
const APP_NAME = APP_KEY ? APP_KEY.split('#')[1] : '';

// Get app token for server-side operations
async function getAppToken() {
  try {
    const response = await axios.post(
      `${AGORA_CHAT_API_BASE}/${ORG_NAME}/${APP_NAME}/token`,
      {
        grant_type: 'client_credentials',
        client_id: process.env.AGORA_APP_ID,
        client_secret: process.env.AGORA_APP_CERTIFICATE
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Agora Chat token:', error.response?.data || error.message);
    throw error;
  }
}

// Send message using Agora Chat AI
async function sendAIMessage(userId, message, resumeDatabase) {
  try {
    const token = await getAppToken();
    
    // Prepare context for AI
    const context = resumeDatabase.map((r, i) => 
      `Candidate ${i + 1}: ${r.name}, Skills: ${r.skills.slice(0, 5).join(', ')}, Experience: ${r.yearsOfExperience} years`
    ).join('\n');
    
    const systemPrompt = `You are a recruitment AI assistant. Answer questions about these candidates:\n${context}`;
    
    // Send message to Agora Chat AI
    const response = await axios.post(
      `${AGORA_CHAT_API_BASE}/${ORG_NAME}/${APP_NAME}/messages`,
      {
        from: 'admin',
        to: [userId],
        type: 'txt',
        body: {
          msg: message,
          system_prompt: systemPrompt
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending AI message:', error.response?.data || error.message);
    throw error;
  }
}

// Create user for chat
async function createChatUser(username, password) {
  try {
    const token = await getAppToken();
    
    const response = await axios.post(
      `${AGORA_CHAT_API_BASE}/${ORG_NAME}/${APP_NAME}/users`,
      {
        username,
        password
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      // User already exists
      return { username, exists: true };
    }
    console.error('Error creating chat user:', error.response?.data || error.message);
    throw error;
  }
}

// Get user token
async function getUserToken(username) {
  try {
    const token = await getAppToken();
    
    const response = await axios.get(
      `${AGORA_CHAT_API_BASE}/${ORG_NAME}/${APP_NAME}/users/${username}/token`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting user token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getAppToken,
  sendAIMessage,
  createChatUser,
  getUserToken
};
