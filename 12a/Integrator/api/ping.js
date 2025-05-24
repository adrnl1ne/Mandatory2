// Super simple ping endpoint - no external dependencies
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Just return a success response directly - don't try to call the webhook server
    return res.status(200).json({
      success: true,
      message: 'Please use the direct ping URL in the browser',
      pingUrl: 'https://8636-91-101-72-250.ngrok-free.app/ping'
    });
  } catch (error) {
    console.error('Error in ping endpoint:', error);
    return res.status(200).json({
      success: false,
      message: 'Error processing ping request',
      error: error.message
    });
  }
};