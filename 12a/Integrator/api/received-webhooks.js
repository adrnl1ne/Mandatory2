// In-memory storage for received webhooks
// Note: This will reset when the function goes cold
let receivedWebhooks = [];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
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
    } else {
      // Return the list of received webhooks
      return res.status(200).json(receivedWebhooks);
    }
  } catch (error) {
    console.error('Error handling webhooks:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
};