// Import axios for forwarding webhooks to the received-webhooks endpoint
const axios = require('axios');

// Webhook receiver endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only process POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Webhook received:', req.body);
    
    // Create webhook data object
    const webhookData = {
      timestamp: new Date().toISOString(),
      data: req.body
    };
    
    // Store the webhook in global.receivedWebhooks
    if (typeof global.receivedWebhooks === 'undefined') {
      global.receivedWebhooks = [];
    }
    
    global.receivedWebhooks.unshift(webhookData);
    if (global.receivedWebhooks.length > 5) {
      global.receivedWebhooks = global.receivedWebhooks.slice(0, 5);
    }
    
    // Try to forward the webhook to the received-webhooks endpoint
    // This is an optional step that might help with persistence between invocations
    try {
      const baseUrl = process.env.VERCEL_URL ? 
        `https://${process.env.VERCEL_URL}` : 
        'http://localhost:3000';
        
      await axios.post(`${baseUrl}/api/received-webhooks`, webhookData);
    } catch (forwardError) {
      console.error('Error forwarding webhook:', forwardError);
      // Continue even if forwarding fails
    }
    
    // Return a success response
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      webhook: webhookData
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process webhook' 
    });
  }
};