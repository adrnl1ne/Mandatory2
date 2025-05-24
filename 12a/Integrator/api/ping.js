// Serverless function to proxy ping requests to the webhook server
const axios = require('axios');

module.exports = async (req, res) => {
  // Get webhook server URL from environment variable or use default
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  
  try {
    // Forward GET request to webhook server
    const response = await axios.get(`${WEBHOOK_SERVER}/ping`);
    
    // Return the webhook server's response
    res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};