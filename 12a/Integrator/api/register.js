const axios = require('axios');

module.exports = async (req, res) => {
  try {
    // Define webhook registration data
    const webhookData = {
      url: "https://12aintegrator.vercel.app/webhook",
      events: ["*"],
      description: "Webhook integrator endpoint"
    };
    
    // Send registration request
    await axios.post("https://8636-91-101-72-250.ngrok-free.app/register-webhook", webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Webhook registered successfully',
      webhook: webhookData
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to register webhook',
      error: error.message
    });
  }
};