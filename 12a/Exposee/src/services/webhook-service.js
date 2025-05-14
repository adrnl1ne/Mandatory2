const crypto = require('crypto');
const axios = require('axios');
const { db } = require('../firebase');

const VALID_EVENTS = [
  'order.created',
  'order.payment_received',
  'order.processing',
  'order.shipped',
  'order.delivered',
  'order.cancelled'
];

// Collection references
const webhooksCollection = db.collection('webhooks');
const webhookEventsCollection = db.collection('webhook_events');

async function registerWebhook(url, events, description) {
  // Validate events
  const validEvents = events.filter(event => VALID_EVENTS.includes(event));
  
  if (validEvents.length === 0) {
    throw new Error('No valid event types provided');
  }
  
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  // Create webhook document
  await webhooksCollection.doc(id).set({
    id,
    url,
    description,
    events: validEvents,
    created_at: timestamp
  });
  
  return {
    id,
    url,
    events: validEvents,
    description,
    created_at: timestamp
  };
}

async function unregisterWebhook(id) {
  const webhookRef = webhooksCollection.doc(id);
  const webhook = await webhookRef.get();
  
  if (!webhook.exists) {
    return false;
  }
  
  await webhookRef.delete();
  return true;
}

async function getWebhooks() {
  const snapshot = await webhooksCollection.get();
  return snapshot.docs.map(doc => doc.data());
}

async function pingWebhooks() {
  const webhooks = await getWebhooks();
  const pingEvent = {
    event_type: 'ping',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test ping' }
  };
  
  const results = [];
  
  for (const webhook of webhooks) {
    try {
      const response = await axios.post(webhook.url, pingEvent);
      results.push({
        webhook_id: webhook.id,
        success: true,
        status: response.status
      });
    } catch (error) {
      results.push({
        webhook_id: webhook.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  registerWebhook,
  unregisterWebhook,
  getWebhooks,
  pingWebhooks,
  VALID_EVENTS
};