// Webhook receiver endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only process POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Webhook received:', req.body);
    
    // Create webhook data object
    const webhookData = {
      timestamp: new Date().toISOString(),
      data: req.body
    };
    
    // Return a success response
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      webhook: webhookData
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process webhook' 
    });
  }
};