// Simple ping API endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simply return a JSON response with the ping URL
  // The actual ping will be handled client-side
  return res.status(200).json({
    success: true,
    message: 'Use client-side ping',
    pingUrl: 'https://8636-91-101-72-250.ngrok-free.app/ping'
  });
};
