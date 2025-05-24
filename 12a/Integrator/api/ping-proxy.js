// Use chrome-aws-lambda and puppeteer-core for Vercel compatibility
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  // Set content type to HTML
  res.setHeader('Content-Type', 'text/html');
  
  // Get webhook server URL
  const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';
  const pingUrl = `${WEBHOOK_SERVER}/ping?testPayload=FromIntegrator_${Date.now()}`;
  
  try {
    let browser;
    
    // Use chrome-aws-lambda in production (Vercel), regular puppeteer in development
    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      // Running on Vercel
      browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      });
    } else {
      // Running locally - requires full puppeteer to be installed
      const fullPuppeteer = require('puppeteer');
      browser = await fullPuppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    
    // Open a new page
    const page = await browser.newPage();
    
    // Navigate to the ping URL with a timeout
    await page.goto(pingUrl, { 
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    
    // Check if we need to click through Ngrok warning page
    try {
      const ngrokButton = await page.$('button#continue');
      if (ngrokButton) {
        await ngrokButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      }
    } catch (clickError) {
      console.log('No Ngrok button found or navigation error', clickError.message);
    }
    
    // Get the page content
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    // Close browser
    await browser.close();
    
    // Send HTML page that posts a message back to parent
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
              data: ${JSON.stringify(bodyText)}
            }, '*');
          };
        </script>
      </head>
      <body>
        <h3>Ping sent successfully</h3>
        <pre>${bodyText}</pre>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in ping proxy:', error);
    
    // Send error page
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
};