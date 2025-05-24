// Import axios for forwarding webhooks to the received-webhooks endpoint
const axios = require('axios');

// Enhanced logging function
function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API:webhook] [${area}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Webhook receiver endpoint
module.exports = async (req, res) => {
  log('REQUEST', `${req.method} ${req.url || 'webhook endpoint'}`);
  log('HEADERS', 'Request headers:', req.headers);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    log('CORS', 'Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Only process POST requests
  if (req.method !== 'POST') {
    log('ERROR', `Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    log('WEBHOOK', 'Processing incoming webhook', req.body);
    
    // Create webhook data object
    const webhookData = {
      timestamp: new Date().toISOString(),
      data: req.body
    };
    
    log('WEBHOOK', 'Created webhook data object');
    
    // Log the webhook for inspection
    log('WEBHOOK_DATA', 'Full webhook content:', {
      timestamp: webhookData.timestamp,
      data: webhookData.data,
      headers: req.headers
    });
    
    // Try to forward the webhook to the server endpoint
    try {
      log('FORWARD', 'Attempting to forward webhook to server endpoint');
      
      const baseUrl = process.env.VERCEL_URL ? 
        `https://${process.env.VERCEL_URL}` : 
        'http://localhost:3000';
        
      log('FORWARD', `Using base URL: ${baseUrl}`);
      
      await axios.post(`${baseUrl}/api/received-webhooks`, webhookData);
      log('FORWARD', 'Successfully forwarded webhook');
    } catch (forwardError) {
      log('ERROR', 'Failed to forward webhook', {
        message: forwardError.message,
        error: forwardError
      });
      // Continue even if forwarding fails
    }
    
    log('RESPONSE', 'Sending success response');
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      webhook: webhookData
    });
  } catch (error) {
    log('ERROR', 'Error processing webhook', {
      message: error.message,
      error: error
    });
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process webhook' 
    });
  }
};