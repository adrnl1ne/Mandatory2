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
    
    // First, try to directly add the webhook to our storage
    try {
      log('TEST', `Sending test webhook directly to API at ${baseUrl}/api/received-webhooks`);
      
      const directResponse = await axios.post(`${baseUrl}/api/received-webhooks`, {
        timestamp: new Date().toISOString(),
        data: testWebhook
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Webhook-Integrator-Self-Test',
          'X-Test-Webhook': '1'
        },
        timeout: 5000
      });
      
      log('TEST', 'Direct storage successful', {
        status: directResponse.status,
        data: directResponse.data
      });
    } catch (directError) {
      log('ERROR', 'Failed direct storage approach', {
        message: directError.message
      });
    }
    
    // Then also try the actual webhook endpoint
    try {
      log('TEST', `Sending test webhook to ${baseUrl}/webhook`);
      
      const webhookResponse = await axios.post(`${baseUrl}/webhook`, testWebhook, {
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
    } catch (webhookError) {
      log('ERROR', 'Failed to send to webhook endpoint', {
        message: webhookError.message
      });
    }
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now try to retrieve it from received-webhooks
    log('TEST', 'Checking if webhook was received');
    
    try {
      const receivedResponse = await axios.get(`${baseUrl}/api/received-webhooks`, {
        timeout: 5000
      });
      
      log('TEST', 'Received webhooks response', {
        status: receivedResponse.status,
        count: receivedResponse.data?.length || 0,
        webhooks: receivedResponse.data
      });
      
      // Check if our test webhook is in the response
      const found = receivedResponse.data.some(webhook => 
        webhook.data && webhook.data.test_id === testId
      );
      
      if (found) {
        log('TEST', 'Test webhook was successfully received!');
        
        return res.status(200).json({
          success: true,
          message: 'Test webhook sent and received successfully!',
          testId,
          found: true
        });
      } else {
        log('TEST', 'Test webhook was sent but not found in received webhooks');
        
        return res.status(202).json({
          success: false,
          message: 'Test webhook was sent but not found in received webhooks',
          testId,
          found: false,
          webhooks: receivedResponse.data
        });
      }
    } catch (receivedError) {
      log('ERROR', 'Failed to check received webhooks', {
        message: receivedError.message
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to verify if webhook was received',
        error: receivedError.message,
        testId
      });
    }
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