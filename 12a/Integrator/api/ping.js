// Direct ping endpoint that doesn't redirect
const axios = require('axios');

// Export a function that handles the request
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
    // Get the webhook server URL
    const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
    
    // Send the ping request to the webhook server
    const response = await axios.get(`${WEBHOOK_SERVER}/ping?from=vercel&t=${Date.now()}`, {
      timeout: 10000 // 10 second timeout
    });
    
    // Return the response from the webhook server
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully! Check below for webhooks in a moment.',
      response: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error);
    
    // Try to provide helpful error information
    let errorMessage = 'Failed to send ping';
    if (error.response) {
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ': No response received from server';
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};