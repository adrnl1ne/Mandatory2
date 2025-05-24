// Reference to webhooks stored in webhook.js
// In a real app, you would use a database or Vercel KV store
// We're using a simple solution for this assignment
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For simplicity, return an empty array - in a real app we would persist data
  return res.status(200).json([]);
};