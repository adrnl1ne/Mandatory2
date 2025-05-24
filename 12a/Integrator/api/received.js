// Simple mock webhooks for demonstration purposes
// In a real application, you would use a database
const mockWebhooks = [
  {
    timestamp: new Date().toISOString(),
    data: {
      event: "ping",
      message: "This is a simulated webhook response",
      sent_at: new Date().toISOString()
    }
  }
];

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Simply return mock webhooks since we can't reliably 
  // share data between serverless function invocations
  return res.status(200).json(mockWebhooks);
};