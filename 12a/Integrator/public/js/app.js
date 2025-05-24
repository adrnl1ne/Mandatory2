// Configuration
const CONFIG = {
  VERCEL_URL: "https://12aintegrator.vercel.app",
  WEBHOOK_SERVER: "https://8636-91-101-72-250.ngrok-free.app"
};

// Fetch configuration
function fetchConfig() {
  // Update UI with config values
  document.getElementById('webhookServerUrl').href = CONFIG.WEBHOOK_SERVER;
  document.getElementById('webhookServerUrl').textContent = CONFIG.WEBHOOK_SERVER;
  document.getElementById('publicUrl').textContent = `${CONFIG.VERCEL_URL}/api/webhook`;
}

// Register webhook
async function registerWebhook() {
  const registerBtn = document.getElementById('registerBtn');
  const statusElement = document.getElementById('registerStatus');
  
  try {
    registerBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = 'Registering webhook...';
    statusElement.classList.remove('hidden');
    
    const response = await fetch('/api/register', { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
      statusElement.className = 'status success';
      statusElement.innerHTML = 'Webhook registered successfully!';
      
      // Display webhook details
      document.getElementById('webhookDetails').textContent = JSON.stringify(data.webhook || data, null, 2);
      document.getElementById('webhookInfo').classList.remove('hidden');
    } else {
      statusElement.className = 'status error';
      statusElement.innerHTML = `Error: ${data.error || data.message || 'Failed to register webhook'}`;
    }
  } catch (error) {
    statusElement.className = 'status error';
    statusElement.innerHTML = `Error: ${error.message}`;
  } finally {
    registerBtn.disabled = false;
  }
}

// Simple ping function - direct browser approach
function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  try {
    pingBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = '';
    statusElement.classList.remove('hidden');
    
    // Open the ping URL directly in a new tab
    const pingWindow = window.open(`${CONFIG.WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`, '_blank');
    
    // Show success message
    statusElement.className = 'status success';
    statusElement.innerHTML = `
      <p>Ping request opened in new browser tab.</p>
      <p>After completing any ngrok verification steps, check back here for received webhooks.</p>
      <p>(Refresh this page after a few seconds to see received webhooks)</p>
    `;
  } catch (error) {
    statusElement.className = 'status error';
    statusElement.innerHTML = `Error: ${error.message}`;
  } finally {
    setTimeout(() => {
      pingBtn.disabled = false;
    }, 1000);
  }
}

// Load received webhooks from the server
async function loadReceivedWebhooks() {
  try {
    const response = await fetch('/api/received');
    if (response.ok) {
      const data = await response.json();
      updateReceivedWebhooks(data);
    }
  } catch (error) {
    console.error('Error loading webhooks:', error);
  }
}

// Update UI with received webhooks
function updateReceivedWebhooks(webhooks = []) {
  const webhooksContainer = document.getElementById('receivedWebhooks');
  const noWebhooksElement = document.getElementById('noWebhooks');
  
  if (webhooks && webhooks.length > 0) {
    noWebhooksElement.classList.add('hidden');
    webhooksContainer.innerHTML = '';
    
    webhooks.forEach((webhook, index) => {
      const webhookElement = document.createElement('div');
      webhookElement.className = 'status';
      webhookElement.style.marginBottom = '10px';
      
      const timeReceived = new Date(webhook.timestamp || Date.now()).toLocaleString();
      webhookElement.innerHTML = `
        <h4>Webhook #${index + 1} - ${timeReceived}</h4>
        <pre>${JSON.stringify(webhook.data || webhook, null, 2)}</pre>
      `;
      
      webhooksContainer.appendChild(webhookElement);
    });
  } else {
    noWebhooksElement.classList.remove('hidden');
    webhooksContainer.innerHTML = '';
  }
}

// Initialize the page
function initPage() {
  // Load configuration
  fetchConfig();
  
  // Set up event listeners
  document.getElementById('registerBtn').addEventListener('click', registerWebhook);
  document.getElementById('pingBtn').addEventListener('click', sendPing);
  
  // Load received webhooks initially
  loadReceivedWebhooks();
  
  // Refresh webhooks periodically
  setInterval(loadReceivedWebhooks, 5000);
}

// Start the application when the page loads
window.addEventListener('DOMContentLoaded', initPage);