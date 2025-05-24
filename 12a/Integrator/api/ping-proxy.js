// Simple ping proxy without complex dependencies
const axios = require('axios');

module.exports = async (req, res) => {
  // Set appropriate headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/html');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get webhook server URL
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  
  // Return a simple HTML page with a link to the webhook server
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Webhook Ping</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .button { 
          display: inline-block; 
          padding: 10px 15px; 
          background-color: #4CAF50; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h3>Send Webhook Ping</h3>
      <p>Click the button below to send a ping to the webhook server:</p>
      <a href="${WEBHOOK_SERVER}/ping?testPayload=FromIntegrator_${Date.now()}" 
         target="_blank" class="button">Send Ping</a>
      
      <p><strong>Note:</strong> After clicking the button, a new tab will open. 
      If you see a "Continue to site" message from ngrok, please click it to proceed.</p>
      
      <p>After sending the ping, close this dialog and check for received webhooks on the main page.</p>
      
      <script>
        // Let the parent window know the iframe loaded successfully
        window.parent.postMessage({
          type: 'ping-iframe-ready'
        }, '*');
      </script>
    </body>
    </html>
  `);
};