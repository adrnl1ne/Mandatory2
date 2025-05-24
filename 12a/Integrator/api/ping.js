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
  
  // Get webhook server URL and ensure it doesn't end with a slash
  let WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  if (WEBHOOK_SERVER.endsWith('/')) {
    WEBHOOK_SERVER = WEBHOOK_SERVER.slice(0, -1);
  }
  
  try {
    console.log(`Sending ping request to ${WEBHOOK_SERVER}/ping`);
    
    // Add testPayload parameter for better testing
    const testPayload = `Ping from ${process.env.VERCEL_URL || 'Integrator'}`;
    const pingUrl = `${WEBHOOK_SERVER}/ping?testPayload=${encodeURIComponent(testPayload)}`;
    
    console.log(`Full ping URL: ${pingUrl}`);
    
    // Use axios to make the GET request
    const response = await axios.get(pingUrl, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`Ping response status: ${response.status}`);
    
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      result: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error.message);
    
    // More detailed error response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Server responded with status ${error.response.status}`);
      console.error('Response data:', error.response.data);
      
      return res.status(200).json({
        success: false,
        message: `Server responded with status ${error.response.status}`,
        error: error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      
      return res.status(200).json({
        success: false,
        message: 'No response received from webhook server',
        error: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error making request:', error.message);
      
      return res.status(200).json({
        success: false,
        message: 'Error making request to webhook server',
        error: error.message
      });
    }
  }
};