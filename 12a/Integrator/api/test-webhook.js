// Test webhook endpoint for debugging
const axios = require('axios');

function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API:test-webhook] [${area}] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('[Circular or non-serializable data]');
    }
  }
}

module.exports = async (req, res) => {
  log('REQUEST', `${req.method} ${req.url || 'test-webhook endpoint'}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    log('CORS', 'Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // Generate a test webhook and report back
  try {
    log('TEST', 'Generating test webhook');
    
    // Get the current Vercel URL
    const baseUrl = process.env.VERCEL_URL ? 
      `https://${process.env.VERCEL_URL}` : 
      req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
    
    log('TEST', `Using base URL: ${baseUrl}`);
    
    // Create test webhook data with a unique ID
    const testId = Math.random().toString(36).substring(2, 15);
    const testWebhook = {
      event: "test_webhook",
      message: "This is a test webhook created by the test endpoint",
      test_id: testId,
      timestamp: new Date().toISOString()
    };
    
    log('TEST', 'Created test webhook', testWebhook);
    
    // Create a webhook data object to directly return to the client
    // This bypasses storage issues in the serverless environment
    const webhookData = {
      timestamp: new Date().toISOString(),
      data: testWebhook
    };
    
    // Return the webhook data directly to the client
    // The client can then display this test webhook immediately
    return res.status(200).json({
      success: true,
      message: 'Test webhook created successfully!',
      webhook: webhookData
    });
    
  } catch (error) {
    log('ERROR', 'Test webhook error', {
      message: error.message
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create test webhook',
      message: error.message
    });
  }
};