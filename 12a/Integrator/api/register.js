const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
    const VERCEL_URL = 'https://12aintegrator.vercel.app';
    
    // Create webhook registration data
    const webhookData = {
      url: `${VERCEL_URL}/api/webhook`,  // Use /api/webhook path for Vercel
      events: ["payment_received", "invoice_processed", "order_created", "order_shipped"],
      description: "Webhook integrator endpoint for SI Mandatory 2"
    };
    
    // Send registration request with a timeout
    const response = await axios({
      method: 'post',
      url: `${WEBHOOK_SERVER}/register-webhook`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: webhookData,
      timeout: 5000  // 5 second timeout
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Webhook registered successfully',
      webhook: webhookData
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Return error response that won't break the frontend
    return res.status(200).json({
      success: false,
      message: 'Failed to register webhook',
      error: error.message
    });
  }
};