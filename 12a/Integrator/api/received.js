// Placeholder for received webhooks (simulated storage)
let receivedWebhooks = [];

// This is just a simple in-memory storage for demo purposes
// In a real app, you would use a database or Vercel KV store
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    // Store a received webhook
    try {
      const webhook = req.body;
      webhook.timestamp = new Date().toISOString();
      
      // Add to front of array
      receivedWebhooks.unshift(webhook);
      
      // Keep only the last 5 webhooks
      if (receivedWebhooks.length > 5) {
        receivedWebhooks = receivedWebhooks.slice(0, 5);
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // Return received webhooks
    return res.status(200).json(receivedWebhooks);
  }
};