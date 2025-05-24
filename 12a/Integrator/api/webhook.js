// Simulated storage for received webhooks
let receivedWebhooks = [];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Process incoming webhook
  if (req.method === 'POST') {
    try {
      // Log the webhook payload
      console.log('Webhook received:', req.body);
      
      // Store the received webhook with timestamp
      const webhook = {
        timestamp: new Date().toISOString(),
        data: req.body
      };
      
      // Add to start of array (most recent first)
      receivedWebhooks.unshift(webhook);
      
      // Keep only the last 5 webhooks
      if (receivedWebhooks.length > 5) {
        receivedWebhooks = receivedWebhooks.slice(0, 5);
      }
      
      // Return success response
      return res.status(200).send('Webhook received successfully');
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(200).send('Error processing webhook');
    }
  } else {
    return res.status(200).send('Webhook endpoint is active. Use POST to send webhooks.');
  }
};