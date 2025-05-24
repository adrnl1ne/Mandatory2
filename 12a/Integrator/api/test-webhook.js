// Test webhook endpoint for debugging
const axios = require('axios');

function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API:test-webhook] [${area}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
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
    
    // Create test webhook data
    const testWebhook = {
      timestamp: new Date().toISOString(),
      data: {
        event: "test_webhook",
        message: "This is a test webhook created by the test endpoint",
        test_id: Math.random().toString(36).substring(2, 15)
      }
    };
    
    log('TEST', 'Created test webhook', testWebhook);
    
    // Try to send the webhook to our own webhook endpoint
    try {
      const baseUrl = process.env.VERCEL_URL ? 
        `https://${process.env.VERCEL_URL}` : 
        'http://localhost:3000';
      
      log('TEST', `Sending test webhook to ${baseUrl}/webhook`);
      
      const webhookResponse = await axios.post(`${baseUrl}/webhook`, testWebhook.data, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Webhook-Integrator-Self-Test',
          'X-Test-Webhook': '1'
        },
        timeout: 5000
      });
      
      log('TEST', 'Test webhook sent successfully', {
        status: webhookResponse.status,
        data: webhookResponse.data
      });
      
      // Now try to retrieve it from received-webhooks
      log('TEST', 'Checking if webhook was received');
      
      const receivedResponse = await axios.get(`${baseUrl}/api/received-webhooks`, {
        timeout: 5000
      });
      
      log('TEST', 'Received webhooks response', {
        status: receivedResponse.status,
        count: receivedResponse.data?.length || 0
      });
      
      // Check if our test webhook is in the response
      const testId = testWebhook.data.test_id;
      const found = receivedResponse.data.some(webhook => 
        webhook.data && webhook.data.test_id === testId
      );
      
      if (found) {
        log('TEST', 'Test webhook was successfully received!');
        
        return res.status(200).json({
          success: true,
          message: 'Test webhook sent and received successfully!',
          testWebhook: testWebhook,
          found: true
        });
      } else {
        log('TEST', 'Test webhook was sent but not found in received webhooks');
        
        return res.status(202).json({
          success: false,
          message: 'Test webhook was sent but not found in received webhooks',
          testWebhook: testWebhook,
          found: false
        });
      }
    } catch (sendError) {
      log('ERROR', 'Failed to send test webhook', {
        message: sendError.message,
        error: sendError
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send test webhook',
        error: sendError.message
      });
    }
  } catch (error) {
    log('ERROR', 'Test webhook error', {
      message: error.message,
      error: error
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create test webhook'
    });
  }
};