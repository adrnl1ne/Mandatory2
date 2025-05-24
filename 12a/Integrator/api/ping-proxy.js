// Use chrome-aws-lambda and puppeteer-core for Vercel compatibility
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const axios = require('axios');

module.exports = async (req, res) => {
  // Set content type to HTML
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Get webhook server URL
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  const pingUrl = `${WEBHOOK_SERVER}/ping?testPayload=FromIntegrator_${Date.now()}`;
  
  try {
    // Try to send the ping request
    const response = await axios.get(pingUrl, {
      timeout: 8000, // 8 second timeout (Vercel limits are 10s)
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    // Return success response as HTML
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ping Proxy</title>
        <script>
          window.onload = function() {
            window.parent.postMessage({
              type: 'ping-result',
              success: true,
              message: 'Ping sent successfully',
              data: ${JSON.stringify(JSON.stringify(response.data))}
            }, '*');
          };
        </script>
      </head>
      <body>
        <h3>Ping sent successfully</h3>
        <pre>${JSON.stringify(response.data, null, 2)}</pre>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in ping proxy:', error.message);
    
    // Check for Ngrok warning page in the error response
    if (error.response && error.response.data && typeof error.response.data === 'string' && 
        error.response.data.includes('ngrok')) {
      
      // Return a special page that explains how to bypass Ngrok warning
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ngrok Warning Page</title>
          <script>
            window.onload = function() {
              window.parent.postMessage({
                type: 'ping-result',
                success: false,
                error: 'Ngrok warning page detected. Please click the link below to continue.',
                isNgrok: true
              }, '*');
            };
          </script>
        </head>
        <body>
          <h3>Ngrok Warning Page Detected</h3>
          <p>You need to manually approve the ngrok domain first time:</p>
          <p><a href="${pingUrl}" target="_blank">Click here to open the ping URL</a></p>
          <p>After approval, click the ping button again.</p>
        </body>
        </html>
      `);
    } else {
      // Regular error page
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ping Proxy Error</title>
          <script>
            window.onload = function() {
              window.parent.postMessage({
                type: 'ping-result',
                success: false,
                error: ${JSON.stringify(error.message)}
              }, '*');
            };
          </script>
        </head>
        <body>
          <h3>Error sending ping</h3>
          <p>${error.message}</p>
        </body>
        </html>
      `);
    }
  }
};