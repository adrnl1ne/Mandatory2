// Use chrome-aws-lambda and puppeteer-core for Vercel compatibility
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Set content type to HTML
  res.setHeader('Content-Type', 'text/html');
  
  // Get webhook server URL
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  
  // Return a page with a direct link to the ping endpoint
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ping Webhook</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .button { display: inline-block; padding: 10px 15px; background-color: #4CAF50; color: white; 
                 text-decoration: none; border-radius: 4px; }
      </style>
      <script>
        function notifyParent(success, message) {
          window.parent.postMessage({
            type: 'ping-result',
            success: success,
            message: message
          }, '*');
        }
      </script>
    </head>
    <body>
      <h3>Webhook Ping</h3>
      <p>Click the button below to send a ping to all registered webhooks:</p>
      <p>
        <a href="${WEBHOOK_SERVER}/ping?testPayload=FromIntegrator_${Date.now()}" 
           target="_blank" 
           class="button" 
           onclick="notifyParent(true, 'Ping request opened in new tab')">
           Send Ping
        </a>
      </p>
      <p>After clicking, check back for received webhooks.</p>
    </body>
    </html>
  `);
};