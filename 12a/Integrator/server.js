const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Enhanced logging function
function log(area, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [SERVER] [${area}] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('[Circular or non-serializable data]');
    }
  }
}

log('SERVER', 'Starting server...');

// Configuration
const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
log('CONFIG', `Webhook server: ${WEBHOOK_SERVER}`);

const PUBLIC_URL = process.env.VERCEL_URL ? 
  `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
log('CONFIG', `Public URL: ${PUBLIC_URL}`);

// In-memory storage for webhooks (resets when serverless function is cold)
let receivedWebhooks = [];

// In-memory storage for registered webhooks
let registeredWebhooks = [];

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  log('REQUEST', `${req.method} ${req.originalUrl}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Endpoint to receive webhooks
app.post('/webhook', (req, res) => {
  log('WEBHOOK', 'Received webhook event', req.body);
  
  // Create webhook data object
  const webhookData = {
    timestamp: new Date().toISOString(),
    data: req.body
  };
  
  // Store the webhook in our in-memory array
  receivedWebhooks.unshift(webhookData);
  log('WEBHOOK', `Added webhook to storage, count: ${receivedWebhooks.length}`);
  
  // Keep only the most recent 5 webhooks
  if (receivedWebhooks.length > 5) {
    receivedWebhooks = receivedWebhooks.slice(0, 5);
    log('WEBHOOK', 'Trimmed webhooks to 5');
  }
  
  // Return a success response
  log('WEBHOOK', 'Sending success response');
  res.status(200).json({ 
    success: true, 
    message: 'Webhook received successfully',
    webhook: webhookData
  });
});

// API endpoint to get received webhooks
app.get('/api/received-webhooks', (req, res) => {
  log('API', 'Received webhooks requested', { count: receivedWebhooks.length });
  
  // If we don't have any webhooks yet, provide an empty array
  // Don't return demo data so it's clear whether real webhooks were received
  res.json(receivedWebhooks);
});

// API endpoint to ping the webhook server
app.get('/api/ping', async (req, res) => {
  log('API', 'GET /api/ping - Sending ping to webhook server');
  
  try {
    const pingUrl = `${WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`;
    log('API', `Pinging URL: ${pingUrl}`);
    
    const response = await axios.get(pingUrl, {
      timeout: 5000
    });
    
    log('API', 'Ping successful', response.data);
    
    res.json({
      success: true,
      message: 'Ping sent successfully!',
      data: response.data
    });
  } catch (error) {
    log('ERROR', 'Ping failed', {
      message: error.message,
      response: error.response ? { 
        status: error.response.status,
        data: error.response.data
      } : null
    });
    
    res.status(500).json({
      success: false,
      message: 'Error sending ping',
      error: error.message
    });
  }
});

// API endpoint to return registered webhooks
app.get('/registered-webhooks', (req, res) => {
  log('API', 'GET /registered-webhooks', { 
    count: registeredWebhooks.length,
    webhooks: registeredWebhooks 
  });
  res.json(registeredWebhooks);
});

// API endpoint to register a webhook
app.post('/api/register', async (req, res) => {
  log('API', 'POST /api/register - Registering webhook');
  
  try {
    // Register with webhook server
    const webhookUrl = `${PUBLIC_URL}/webhook`;
    log('REGISTER', `Registering webhook URL: ${webhookUrl}`);
    
    const response = await axios.post(`${WEBHOOK_SERVER}/register-webhook`, {
      url: webhookUrl,
      events: ['*'],
      description: 'Webhook integrator endpoint'
    });
    
    log('REGISTER', 'Registration successful', response.data);
    
    // Store the registered webhook
    const webhook = response.data;
    registeredWebhooks = [webhook];
    
    res.json({ 
      success: true, 
      message: 'Webhook registered successfully', 
      webhook 
    });
  } catch (error) {
    log('ERROR', 'Registration failed', {
      message: error.message,
      response: error.response ? { 
        status: error.response.status,
        data: error.response.data
      } : null
    });
    
    res.status(500).json({
      success: false,
      message: error.response ? error.response.data.message || 'Registration failed' : 'Registration failed',
      error: error.message
    });
  }
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    availableEndpoints: ['/api/ping', '/api/received-webhooks']
  });
});

// Export for Vercel serverless deployment
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    log('SERVER', `Server running at http://localhost:${PORT}`);
  });
}