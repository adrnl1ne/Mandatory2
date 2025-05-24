// Configuration
const CONFIG = {
  VERCEL_URL: "https://12aintegrator.vercel.app",
  WEBHOOK_SERVER: "https://8636-91-101-72-250.ngrok-free.app"
};

// Fetch configuration from the server
function fetchConfig() {
  document.getElementById('webhookServerUrl').href = CONFIG.WEBHOOK_SERVER;
  document.getElementById('webhookServerUrl').textContent = CONFIG.WEBHOOK_SERVER;
  document.getElementById('publicUrl').textContent = `${CONFIG.VERCEL_URL}/webhook`;
}

// Register webhook with the server
async function registerWebhook() {
  const registerBtn = document.getElementById('registerBtn');
  const statusElement = document.getElementById('registerStatus');
  
  try {
    registerBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = 'Registering webhook...';
    statusElement.classList.remove('hidden');
    
    const response = await fetch('/api/register', { 
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (response.ok) {
      statusElement.className = 'status success';
      statusElement.innerHTML = 'Webhook registered successfully!';
      
      // Display webhook details
      document.getElementById('webhookDetails').textContent = JSON.stringify(data.webhook || data, null, 2);
      document.getElementById('webhookInfo').classList.remove('hidden');
    } else {
      statusElement.className = 'status error';
      statusElement.innerHTML = `Error: ${data.error || 'Failed to register webhook'}`;
    }
  } catch (error) {
    statusElement.className = 'status error';
    statusElement.innerHTML = `Error: ${error.message}`;
  } finally {
    registerBtn.disabled = false;
  }
}

// Direct ping function - no API calls
function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  try {
    pingBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = '';
    statusElement.classList.remove('hidden');
    
    // Direct approach: open the ping URL in a new tab
    window.open(`${CONFIG.WEBHOOK_SERVER}/ping`, '_blank');
    
    // Show success message
    statusElement.className = 'status success';
    statusElement.innerHTML = `
      <p>Ping request opened in new browser tab.</p>
      <p>After handling any ngrok warning pages, check back here for received webhooks.</p>
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

// Function to load received webhooks
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

// Update the UI with received webhooks
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