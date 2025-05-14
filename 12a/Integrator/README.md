# Webhook Integrator Documentation

## Overview

The **Webhook Integrator** is a Node.js application that demonstrates integration with webhook systems. It registers with an external webhook service, receives webhook events, and provides a user interface to manage and monitor these events.

---

## Project Structure

```
/
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Node.js dependencies and scripts
├── register-webhook.js    # Script to register webhook with external service
├── server.js              # Main server application
├── storage.js             # Data persistence utilities
├── vercel.json            # Vercel deployment configuration
└── public/                # Static files served to the client
    ├── index.html         # Main user interface
    └── js/
        └── main.js        # Frontend JavaScript
```

---

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Account with the webhook system ([2awebhooksystem.vercel.app](https://2awebhooksystem.vercel.app))

### Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   PORT=3001
   WEBHOOK_SERVER=https://2awebhooksystem.vercel.app
   PUBLIC_URL=http://localhost:3001
   ```

### Running the Application

- Start the server:
  ```bash
  npm start
  ```
- Open your browser and navigate to [http://localhost:3001](http://localhost:3001)

---

## Configuration

The application can be configured using environment variables:

- `PORT`: The port on which the server will run (default: 3001)
- `WEBHOOK_SERVER`: URL of the webhook system to integrate with
- `PUBLIC_URL`: Publicly accessible URL of your application (for local development, use ngrok or similar tool)
- `VERCEL_URL`: Automatically set by Vercel when deployed

---

## API Endpoints

### Client API Endpoints

- `GET /api/config`: Returns configuration information for the frontend
- `GET /api/status`: Returns the status of webhook registration and received events
- `POST /api/register`: Registers a new webhook with the external service
- `POST /api/ping`: Sends a ping request to test all registered webhooks

### Webhook Endpoint

- `POST /webhook`: Endpoint that receives webhook events from the external service

---

## Usage Instructions

### Registering a Webhook

1. Open the application in your browser.
2. View your webhook endpoint URL displayed on the page.
3. Click the **Register Webhook** button.
4. The application will register with all available event types from the webhook system.
5. Registration details will be displayed on successful registration.

### Testing the Webhook

1. After registering a webhook, click the **Send Ping** button.
2. This will instruct the webhook system to send a test ping to all registered webhooks.
3. The received webhook will appear in the **Received Webhooks** section.

### Viewing Received Webhooks

The application stores and displays the last 5 webhooks received. Each webhook shows:

- Event type
- Timestamp
- Event data

---

## Technical Implementation

### Data Persistence

The application stores data in two ways:

- **Local JSON files** (for local development):
  - `data/registered_webhook.json`: Contains information about the registered webhook
  - `data/received_webhooks.json`: Contains a history of received webhooks
- **Vercel KV storage** when deployed on Vercel

### Webhook Registration Process

- The application fetches available event types from the webhook system.
- It registers its `/webhook` endpoint with all available event types.
- Registration details are stored for later reference.

### Webhook Reception

When a webhook is received:

- The event is logged to the console.
- The event is stored in the received webhooks history.
- The UI is updated to display the new event.

---

## Security Considerations

The application includes basic security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

For production use, consider implementing additional security measures such as:

- Webhook signature validation
- Rate limiting
- HTTPS encryption
- Authentication for the admin interface

---

## Deployment

This application is configured for deployment on Vercel:

1. Create a Vercel account.
2. Connect your repository to Vercel.
3. Set the required environment variables.
4. Deploy the application.

The deployed application will automatically use the Vercel URL for webhook registration.
