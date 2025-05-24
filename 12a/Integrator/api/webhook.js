// Global variable to temporarily store webhooks
// Note: This won't persist across function invocations
const MAX_WEBHOOKS = 5;
const webhooks = [];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle webhook request
  if (req.method === 'POST') {
    try {
      console.log('Webhook received:', req.body);
      
      // Add webhook to the beginning of array (most recent first)
      webhooks.unshift({
        timestamp: new Date().toISOString(),
        data: req.body
      });
      
      // Keep only the most recent webhooks
      while (webhooks.length > MAX_WEBHOOKS) {
        webhooks.pop();
      }
      
      return res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(200).send('Error processing webhook');
    }
  }
  
  // Default response
  return res.status(200).send('Webhook endpoint active');
};