const express = require('express');
const bodyParser = require('body-parser');
const swaggerSpec = require('./swagger');
const webhookRoutes = require('./routes/webhook');
const webhookService = require('./services/webhook-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Serve Swagger UI with CDN
app.get('/api-docs', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Webhook API - Swagger UI</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui.css">
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerSpec)},
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ]
            });
            window.ui = ui;
          };
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Redirect root to Swagger UI
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Routes
app.use('/webhooks', webhookRoutes);

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Send a test ping to all registered webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Ping sent successfully
 */
app.get('/ping', async (req, res) => {
  try {
    const results = await webhookService.pingWebhooks();
    res.status(200).json({
      message: 'Ping sent to all registered webhooks',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`Root path redirects to Swagger UI`);
});