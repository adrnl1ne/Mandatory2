// Serverless function to proxy ping requests to the webhook server
const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get webhook server URL
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  
  // Process ping request (handles both GET and POST)
  try {
    console.log(`Sending ping request to ${WEBHOOK_SERVER}/ping`);
    
    // Make GET request to webhook server
    const response = await axios({
      method: 'get',
      url: `${WEBHOOK_SERVER}/ping`,
      headers: {
        'Accept': 'application/json'
      },
      responseType: 'text',
      timeout: 10000
    });
    
    // Return a proper JSON response
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully'
    });
  } catch (error) {
    console.error('Error sending ping:', error.message);
    
    // Return error response
    return res.status(200).json({
      success: false,
      message: `Error: ${error.message}`,
      error: error.message
    });
  }
};