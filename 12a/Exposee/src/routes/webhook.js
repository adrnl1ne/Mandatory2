const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhook-service');

/**
 * @swagger
 * /webhooks/register:
 *   post:
 *     summary: Register a new webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookRequest'
 *     responses:
 *       201:
 *         description: Webhook registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Webhook'
 *       400:
 *         description: Bad request
 */
router.post('/register', async (req, res) => {
  try {
    const { url, events, description } = req.body;
    
    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'URL and events array are required' });
    }
    
    const webhook = await webhookService.registerWebhook(url, events, description);
    res.status(201).json(webhook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhooks/{id}:
 *   delete:
 *     summary: Unregister a webhook
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The webhook ID
 *     responses:
 *       200:
 *         description: Webhook unregistered successfully
 *       404:
 *         description: Webhook not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await webhookService.unregisterWebhook(id);
    
    if (deleted) {
      res.status(200).json({ success: true, message: 'Webhook unregistered' });
    } else {
      res.status(404).json({ error: 'Webhook not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhooks:
 *   get:
 *     summary: List all webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: A list of webhooks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Webhook'
 */
router.get('/', async (req, res) => {
  try {
    const webhooks = await webhookService.getWebhooks();
    res.status(200).json(webhooks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhooks/events:
 *   get:
 *     summary: List all valid event types
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: A list of valid event types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/events', (req, res) => {
  res.status(200).json({ events: webhookService.VALID_EVENTS });
});

module.exports = router;