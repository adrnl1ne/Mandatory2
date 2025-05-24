// Serverless function to proxy ping requests to the webhook server
const axios = require('axios');

module.exports = async (req, res) => {
  // Get webhook server URL from environment variable or use default
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  
  try {
    // Forward GET request to webhook server with proper headers
    const response = await axios.get(`${WEBHOOK_SERVER}/ping`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Important: don't parse as JSON automatically, handle response manually
      responseType: 'text'
    });
    
    // Check if response is JSON or HTML
    let responseData;
    
    try {
      // Try to parse as JSON
      responseData = JSON.parse(response.data);
    } catch (parseError) {
      // If parsing fails, it's probably HTML
      console.log("Received non-JSON response from webhook server");
      
      // Send a simplified response with the text content
      return res.status(200).json({
        success: true,
        message: 'Ping sent successfully',
        data: {
          content: "Webhook server was pinged, but returned HTML content",
          responseType: "html"
        }
      });
    }
    
    // If we get here, the response was valid JSON
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      data: responseData
    });
    
  } catch (error) {
    console.error('Error sending ping:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};