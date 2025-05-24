const axios = require('axios');
require('dotenv').config();

// Configuration
const WEBHOOK_SERVER = process.env.WEBHOOK_SERVER || 'https://8636-91-101-72-250.ngrok-free.app';

// Determine PUBLIC_URL (works locally and on Vercel)
let PUBLIC_URL;
if (process.env.VERCEL_URL) {
  // Running on Vercel
  PUBLIC_URL = `https://${process.env.VERCEL_URL}`;
} else {
  // Local development
  PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001';
}

async function registerWebhook() {
  try {
    // Get available event types
    console.log('Fetching available event types...');
    const eventsResponse = await axios.get(`${WEBHOOK_SERVER}/webhooks/events`);
    const events = eventsResponse.data.events;
    console.log(`Available event types: ${events.join(', ')}`);
    
    // Register webhook
    console.log(`Registering webhook URL: ${PUBLIC_URL}/webhook`);
    const response = await axios.post(`${WEBHOOK_SERVER}/register-webhook`, {
      url: `${PUBLIC_URL}/webhook`,
      events: events, // Subscribe to all available events
      description: 'Webhook integrator endpoint'
    });
    
    console.log('✅ Webhook registered successfully!');
    console.log('Webhook ID:', response.data.id);
    console.log('Subscribed to events:', response.data.events.join(', '));
    console.log('\nTo test the webhook, run:');
    console.log(`curl ${WEBHOOK_SERVER}/ping`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error registering webhook:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Run the script if it's called directly
if (require.main === module) {
  registerWebhook()
    .catch(error => {
      process.exit(1);
    });
}

module.exports = { registerWebhook };