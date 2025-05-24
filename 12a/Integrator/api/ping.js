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
    // Instead of /ping, use /ping-webhook or try to trigger a webhook manually
    // Based on your successful register-webhook endpoint
    const response = await axios({
      method: 'post',  // Try POST instead of GET
      url: `${WEBHOOK_SERVER}/trigger-event`,  // Try an event triggering endpoint
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        event_type: 'ping',
        data: {
          message: 'Ping from integrator',
          timestamp: new Date().toISOString()
        }
      },
      responseType: 'text',
      timeout: 10000
    });
    
    return res.status(200).json({
      success: true,
      message: 'Event trigger sent successfully'
    });
  } catch (error) {
    console.error('Error sending ping:', error.message);
    
    return res.status(200).json({
      success: false,
      message: `The ping endpoint doesn't exist on the exposee server. Try a different endpoint or check the documentation.`,
      error: error.message
    });
  }
};