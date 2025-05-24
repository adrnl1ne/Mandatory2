// In-memory storage for received webhooks
// Note: This will reset when the function goes cold
let receivedWebhooks = [];

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
      // Store a new webhook
      const webhook = req.body;
      webhook.timestamp = new Date().toISOString();
      
      // Add to the beginning of the array
      receivedWebhooks.unshift(webhook);
      
      // Keep only the most recent 5 webhooks
      if (receivedWebhooks.length > 5) {
        receivedWebhooks = receivedWebhooks.slice(0, 5);
      }
      
      return res.status(200).json({ success: true, webhooks: receivedWebhooks });
    } catch (error) {
      console.error('Error storing webhook:', error);
      return res.status(500).json({ success: false, error: 'Failed to store webhook' });
    }
  }
  
  // Handle GET requests (retrieve webhooks)
  if (req.method === 'GET') {
    // Return stub data if we don't have real webhooks yet
    if (receivedWebhooks.length === 0) {
      return res.status(200).json([
        {
          timestamp: new Date().toISOString(),
          data: {
            event: "demo_webhook",
            message: "This is a demonstration webhook. Real webhooks will appear here when received.",
            timestamp: new Date().toISOString()
          }
        }
      ]);
    }
    
    return res.status(200).json(receivedWebhooks);
  }
  
  // Any other method is not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};