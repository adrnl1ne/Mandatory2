// Direct ping endpoint that doesn't redirect
const axios = require('axios');

// Enhanced logging function
function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API:ping] [${area}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Add cloud logging if available
async function cloudLog(message, data) {
  try {
    // This could send logs to a more permanent storage
    console.log(`CLOUD_LOG: ${message}`, data);
    
    // Return true if logging was successful
    return true;
  } catch (error) {
    console.error('Error in cloud logging:', error);
    return false;
  }
}

// Export a function that handles the request
module.exports = async (req, res) => {
  log('REQUEST', `${req.method} ${req.url || 'ping endpoint'}`);
  await cloudLog('Ping requested', { method: req.method, ip: req.headers['x-forwarded-for'] || 'unknown' });
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    log('CORS', 'Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  try {
    // Get the webhook server URL
    const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
    const pingUrl = `${WEBHOOK_SERVER}/ping?from=vercel&t=${Date.now()}`;
    
    log('PING', `Sending ping to: ${pingUrl}`);
    await cloudLog('Sending ping', { url: pingUrl });
    
    // Send the ping request to the webhook server
    const response = await axios.get(pingUrl, {
      timeout: 10000 // 10 second timeout
    });
    
    log('PING', 'Ping successful', response.data);
    await cloudLog('Ping successful', response.data);
    
    // Return the response from the webhook server
    log('RESPONSE', 'Sending success response');
    return res.status(200).json({
      success: true,
      message: 'Ping sent successfully! Check below for webhooks in a moment.',
      response: response.data
    });
  } catch (error) {
    log('ERROR', 'Ping failed', {
      message: error.message,
      response: error.response ? { 
        status: error.response.status,
        data: error.response.data
      } : null
    });
    
    await cloudLog('Ping failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Try to provide helpful error information
    let errorMessage = 'Failed to send ping';
    if (error.response) {
      errorMessage += `: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage += ': No response received from server';
    } else {
      errorMessage += `: ${error.message}`;
    }
    
    log('RESPONSE', 'Sending error response', { errorMessage });
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};