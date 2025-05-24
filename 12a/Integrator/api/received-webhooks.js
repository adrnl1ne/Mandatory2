// In-memory storage for received webhooks
let receivedWebhooks = [];

// Enhanced logging function
function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API:received-webhooks] [${area}] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('[Circular or non-serializable data]');
    }
  }
}

module.exports = (req, res) => {
  log('REQUEST', `${req.method} ${req.url || '/api/received-webhooks'}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    log('CORS', 'Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  // Handle POST requests (store new webhook)
  if (req.method === 'POST') {
    try {
      log('STORE', 'Received webhook data for storage', req.body);
      
      // Store a new webhook
      const webhook = req.body;
      
      // Make sure timestamp exists
      if (!webhook.timestamp) {
        webhook.timestamp = new Date().toISOString();
      }
      
      // Add to the beginning of the array
      receivedWebhooks.unshift(webhook);
      log('STORE', `Webhook added to storage, total: ${receivedWebhooks.length}`);
      
      // Keep only the most recent 5 webhooks
      if (receivedWebhooks.length > 5) {
        receivedWebhooks = receivedWebhooks.slice(0, 5);
        log('STORE', 'Trimmed webhooks to 5');
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook stored successfully',
        webhooks: receivedWebhooks 
      });
    } catch (error) {
      log('ERROR', 'Error storing webhook', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to store webhook',
        message: error.message 
      });
    }
  }
  
  // Handle GET requests (retrieve webhooks)
  if (req.method === 'GET') {
    log('FETCH', `Returning ${receivedWebhooks.length} stored webhooks`);
    
    // Always return what we have
    return res.status(200).json(receivedWebhooks);
  }
  
  // Any other method is not allowed
  log('ERROR', `Method not allowed: ${req.method}`);
  return res.status(405).json({ error: 'Method not allowed' });
};