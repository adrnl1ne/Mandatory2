// In-memory storage for received webhooks
// Note: This will reset when the function goes cold
const receivedWebhooks = [];

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle POST requests (store new webhook)
  if (req.method === 'POST') {
    try {
      const webhook = req.body;
      
      // Make sure timestamp exists
      if (!webhook.timestamp) {
        webhook.timestamp = new Date().toISOString();
      }
      
      // Add to the beginning of the array
      receivedWebhooks.unshift(webhook);
      
      // Keep only the most recent 5 webhooks
      if (receivedWebhooks.length > 5) {
        receivedWebhooks.splice(5);
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook stored',
        webhooks: receivedWebhooks 
      });
    } catch (error) {
      console.error('Error storing webhook:', error);
      return res.status(500).json({ success: false, error: 'Failed to store webhook' });
    }
  }
  
  // Handle GET requests (retrieve webhooks)
  if (req.method === 'GET') {
    // If we have stored webhooks, return them
    if (receivedWebhooks.length > 0) {
      return res.status(200).json(receivedWebhooks);
    } 
    
    // Otherwise return a sample webhook
    return res.status(200).json([{
      timestamp: new Date().toISOString(),
      data: {
        event: "welcome",
        message: "Your webhooks will appear here once received.",
        note: "This is just a placeholder. Real webhooks will replace this."
      }
    }]);
  }
  
  // Any other method is not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};