// Direct ping endpoint that doesn't redirect
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the webhook server URL from the configuration
    const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
    
    // Send the ping request to the webhook server
    const response = await axios.get(`${WEBHOOK_SERVER}/ping`, {
      timeout: 8000 // 8 second timeout
    });
    
    // Return the response from the webhook server
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      response: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send ping',
      error: error.message
    });
  }
};