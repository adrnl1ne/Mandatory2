const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Configuration
const WEBHOOK_SERVER = 'https://8636-91-101-72-250.ngrok-free.app';
const PUBLIC_URL = process.env.VERCEL_URL ? 
  `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

// In-memory storage for webhooks (resets when serverless function is cold)
let receivedWebhooks = [];

// In-memory storage for registered webhooks
let registeredWebhooks = [];

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
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
  console.log('Webhook received:', req.body);
  
  const webhookData = {
    timestamp: new Date().toISOString(),
    data: req.body
  };
  
  // Store webhook
  receivedWebhooks.unshift(webhookData);
  
  // Keep only last 5
  if (receivedWebhooks.length > 5) {
    receivedWebhooks = receivedWebhooks.slice(0, 5);
  }
  
  // Return success
  res.status(200).json({ success: true, message: 'Webhook received' });
});

// API endpoint to get received webhooks
app.get('/api/received-webhooks', (req, res) => {
  res.json(receivedWebhooks);
});

// API endpoint to ping the webhook server
app.get('/api/ping', async (req, res) => {
  try {
    const response = await axios.get(`${WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      message: 'Ping sent successfully!',
      data: response.data
    });
  } catch (error) {
    console.error('Error sending ping:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error sending ping',
      error: error.message
    });
  }
});

// API endpoint to return registered webhooks
app.get('/registered-webhooks', (req, res) => {
  res.json(registeredWebhooks);
});

// API endpoint to register a webhook
app.post('/api/register', async (req, res) => {
  try {
    // Register with webhook server
    const response = await axios.post(`${WEBHOOK_SERVER}/register-webhook`, {
      url: `${PUBLIC_URL}/webhook`,
      events: ['*'],
      description: 'Webhook integrator endpoint'
    });
    
    // Store the registered webhook
    const webhook = response.data;
    registeredWebhooks = [webhook];
    
    res.json({ 
      success: true, 
      message: 'Webhook registered successfully', 
      webhook 
    });
  } catch (error) {
    console.error('Error registering webhook:', error);
    
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
    availableEndpoints: ['/api/ping', '/api/received-webhooks', '/api/register']
  });
});

// Export for Vercel serverless deployment
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}