# Order Webhook System

A webhook registration system for e-commerce order events, allowing integrators to subscribe to various order-related events.

---

## Overview

This system provides a simple API for registering, managing, and testing webhooks. It's designed to notify external services about events in an order processing workflow, making it easy to integrate with our e-commerce platform.

---

## Event Types

The following event types are supported:

- `order.created` — Triggered when a new order is placed
- `order.payment_received` — Triggered when payment is received
- `order.processing` — Triggered when order fulfillment begins
- `order.shipped` — Triggered when an order ships
- `order.delivered` — Triggered when delivery is confirmed
- `order.cancelled` — Triggered when an order is cancelled

---

## API Documentation and Testing

- Access the server at: [https://2awebhooksystem.vercel.app](https://2awebhooksystem.vercel.app)
- The Swagger UI will load automatically, allowing you to explore and test the API endpoints.
- For local development, start the server and navigate to [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

### Webhook Registration

**POST** `/webhooks/register`  
Register a new webhook.

**Request body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["order.created", "order.shipped"],
  "description": "My order events webhook"
}
```

---

### Webhook Unregistration

**DELETE** `/webhooks/:id`  
Unregister a webhook by ID.

**Response (success):**
```json
{
  "success": true,
  "message": "Webhook unregistered"
}
```

**Response (not found):**
```json
{
  "error": "Webhook not found"
}
```

---

### List Webhooks

**GET** `/webhooks`  
List all registered webhooks.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://example.com/webhook",
  "events": ["order.created", "order.shipped"],
  "description": "My order events webhook",
  "created_at": "2025-05-13T14:30:45.123Z"
}
```

---

### List Valid Events

**GET** `/webhooks/events`  
List all valid event types.

**Response:**
```json
{
  "events": [
    "order.created",
    "order.payment_received",
    "order.processing",
    "order.shipped",
    "order.delivered",
    "order.cancelled"
  ]
}
```

---

### Ping Webhooks

**GET** `/ping`  
Send test ping event to all registered webhooks.

**Response:**
```json
{
  "message": "Ping sent to all registered webhooks",
  "results": [
    {
      "webhook_id": "550e8400-e29b-41d4-a716-446655440000",
      "success": true,
      "status": 200
    }
  ]
}
```

---

## Webhook Payload Format

When events occur, webhooks will receive a POST request with a JSON payload.

**For ping events:**
```json
{
  "event_type": "ping",
  "timestamp": "2025-05-13T14:35:22.123Z",
  "data": {
    "message": "This is a test ping"
  }
}
```

**For order.created events:**
```json
{
  "event_type": "order.created",
  "timestamp": "2025-05-13T14:32:10.123Z",
  "data": {
    "order_id": "ORD12345",
    "customer": "customer123",
    "items": [
      {"product_id": "prod1", "quantity": 2}
    ],
    "total": 59.98
  }
}
```

---

## Integration Guidelines

1. Register a webhook with the events you want to listen for.
2. Implement an HTTP endpoint at your specified URL that accepts POST requests.
3. Your endpoint should respond with a 2xx status code upon successful receipt.
4. For testing, use the `/ping` endpoint to verify your webhook is receiving events properly.
5. Ensure your endpoint can handle the payload format described above.
6. Implement appropriate error handling for missed or failed webhook deliveries.

---

## Technical Implementation

- **Node.js** and **Express**
- **SQLite** database for webhook storage
- **Swagger UI** for API documentation
- **Vercel** for deployment

---

## Security Considerations

- All webhook URLs must use HTTPS (except for localhost during development).
- The system will retry failed webhook deliveries up to 3 times.
- Consider implementing signature verification for production use.
