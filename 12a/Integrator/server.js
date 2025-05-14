const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { registerWebhook } = require('./register-webhook');
const kvStorage = require('./storage');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3001;
const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8fd5-195-249-146-101.ngrok-free.app';

// Determine PUBLIC_URL (works locally and on Vercel)
let PUBLIC_URL;
if (process.env.VERCEL_URL) {
  // Running on Vercel
  PUBLIC_URL = `https://${process.env.VERCEL_URL}`;
} else {
  // Local development
  PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
}

// File paths for data persistence
const DATA_DIR = path.join(__dirname, 'data');
const WEBHOOK_FILE = path.join(DATA_DIR, 'registered_webhook.json');
const RECEIVED_FILE = path.join(DATA_DIR, 'received_webhooks.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Save data to file
async function saveData(filePath, data) {
  if (process.env.NODE_ENV === 'production') {
    // Use KV storage in production
    const key = path.basename(filePath, '.json');
    return kvStorage.saveData(key, data);
  } else {
    // Use file storage in development
    try {
      await ensureDataDir();
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving to ${filePath}:`, error);
    }
  }
}

// Load data from file or KV store
async function loadData(filePath, defaultValue) {
  if (process.env.NODE_ENV === 'production') {
    // Use KV storage in production
    const key = path.basename(filePath, '.json');
    return kvStorage.loadData(key, defaultValue);
  } else {
    // Use file storage in development
    try {
      await ensureDataDir();
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, return default
        return defaultValue;
      }
      console.error(`Error loading from ${filePath}:`, error);
      return defaultValue;
    }
  }
}

const app = express();

// Middleware
app.use(bodyParser.json());

// Add after initializing app
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files from the public directory
app.use(express.static('public'));

// Endpoint to receive webhooks
app.post('/webhook', async (req, res) => {
  console.log('📣 Webhook received:', JSON.stringify(req.body, null, 2));
  
  // Store the received webhook
  try {
    const receivedWebhooks = await loadData(RECEIVED_FILE, []);
    
    receivedWebhooks.unshift({
      event_type: req.body.event_type,
      timestamp: req.body.timestamp,
      data: req.body.data
    });
    
    // Keep only the last 5 webhooks
    const trimmedWebhooks = receivedWebhooks.slice(0, 5);
    await saveData(RECEIVED_FILE, trimmedWebhooks);
    
    res.status(200).send('Webhook received successfully');
  } catch (error) {
    console.error('Error storing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// API endpoint to register webhook
app.post('/api/register', async (req, res) => {
  try {
    const result = await registerWebhook();
    await saveData(WEBHOOK_FILE, result);
    
    res.status(200).json({
      success: true,
      message: 'Webhook registered successfully',
      webhook: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register webhook',
      error: error.message
    });
  }
});

// API endpoint to ping the exposee server
app.post('/api/ping', async (req, res) => {
  try {
    const response = await axios.get(`${WEBHOOK_SERVER}/ping`);
    res.status(200).json({
      success: true,
      message: 'Ping sent successfully',
      result: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send ping',
      error: error.message
    });
  }
});

// API endpoint to get webhook status
app.get('/api/status', async (req, res) => {
  try {
    const registeredWebhook = await loadData(WEBHOOK_FILE, null);
    const receivedWebhooks = await loadData(RECEIVED_FILE, []);
    
    res.json({
      registered: registeredWebhook !== null,
      webhook: registeredWebhook,
      received: receivedWebhooks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve webhook status'
    });
  }
});

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
  res.json({
    webhookServer: WEBHOOK_SERVER,
    publicUrl: PUBLIC_URL
  });
});

// Root route - serve the index.html file from public directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all route - serve the index.html file from public directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Webhook receiver server running at http://localhost:${PORT}`);
    console.log(`Webhook endpoint: ${PUBLIC_URL}/webhook`);
  });
}

// Export the Express app for Vercel
module.exports = app;