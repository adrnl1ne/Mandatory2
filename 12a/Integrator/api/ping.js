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
  
  try {
    console.log(`Sending ping request to ${WEBHOOK_SERVER}/ping`);
    
    // Use GET request to the correct /ping endpoint as documented
    const response = await axios({
      method: 'get',  // Use GET as documented
      url: `${WEBHOOK_SERVER}/ping`,  // Use the correct endpoint
      headers: {
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    console.log(`Received response with status ${response.status}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      result: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error.message);
    
    // Return error response with proper formatting
    return res.status(200).json({
      success: false,
      message: `Error pinging webhook server: ${error.message}`,
      error: error.message
    });
  }
};