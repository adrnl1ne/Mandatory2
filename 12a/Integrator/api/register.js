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
  
  try {
    // Get webhook server URL
    const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
    const VERCEL_URL = process.env.VERCEL_URL || 'https://12aintegrator.vercel.app';
    
    // Create webhook registration data
    const webhookData = {
      url: `${VERCEL_URL}/webhook`,
      events: ["*"],
      description: "Webhook integrator endpoint"
    };
    
    // Send registration request
    const response = await axios.post(`${WEBHOOK_SERVER}/register-webhook`, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Webhook registered successfully',
      webhook: webhookData
    });
  } catch (error) {
    // Return error response
    res.status(500).json({
      success: false,
      message: `Failed to register webhook: ${error.message}`,
      error: error.message
    });
  }
};