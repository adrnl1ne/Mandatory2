const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Use MAIN_DOMAIN environment variable if available, otherwise use VERCEL_URL or localhost
const serverUrl = process.env.MAIN_DOMAIN 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

console.log('Using server URL:', serverUrl);

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Order Webhook API',
    version: '1.0.0',
    description: 'API for managing webhooks for e-commerce order events',
    contact: {
      name: 'Support',
      url: 'https://example.com',
    },
  },
  servers: [
    {
      url: serverUrl,
      description: 'API Server',
    },
  ],
  tags: [
    {
      name: 'Webhooks',
      description: 'Webhook management endpoints',
    },
  ],
  components: {
    schemas: {
      WebhookRequest: {
        type: 'object',
        required: ['url', 'events'],
        properties: {
          url: {
            type: 'string',
            description: 'The URL where webhooks will be sent',
            example: 'https://example.com/webhook',
          },
          events: {
            type: 'array',
            description: 'Array of event types to subscribe to',
            items: {
              type: 'string',
              enum: [
                'order.created',
                'order.payment_received',
                'order.processing',
                'order.shipped',
                'order.delivered',
                'order.cancelled',
              ],
            },
            example: ['order.created', 'order.shipped'],
          },
          description: {
            type: 'string',
            description: 'Optional description of the webhook',
            example: 'My order events webhook',
          },
        },
      },
      Webhook: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique webhook identifier',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          url: {
            type: 'string',
            description: 'The URL where webhooks will be sent',
            example: 'https://example.com/webhook',
          },
          events: {
            type: 'array',
            description: 'Array of event types subscribed to',
            items: {
              type: 'string',
            },
            example: ['order.created', 'order.shipped'],
          },
          description: {
            type: 'string',
            description: 'Description of the webhook',
            example: 'My order events webhook',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the webhook was created',
            example: '2025-05-13T14:30:45.123Z',
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;