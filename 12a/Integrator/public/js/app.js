// Configuration
const CONFIG = {
  VERCEL_URL: "https://12aintegrator.vercel.app",
  WEBHOOK_SERVER: "https://8636-91-101-72-250.ngrok-free.app"
};

// Fetch configuration from the server
async function fetchConfig() {
  try {
    document.getElementById('webhookServerUrl').href = CONFIG.WEBHOOK_SERVER;
    document.getElementById('webhookServerUrl').textContent = CONFIG.WEBHOOK_SERVER;
    document.getElementById('publicUrl').textContent = `${CONFIG.VERCEL_URL}/webhook`;
  } catch (error) {
    console.error('Error setting up configuration:', error);
  }
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

// Simplified ping function that uses the iframe approach
async function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  try {
    pingBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = 'Loading ping interface...';
    statusElement.classList.remove('hidden');
    
    // Create and show iframe
    const iframe = document.createElement('iframe');
    iframe.src = '/api/ping-proxy';
    iframe.style.width = '100%';
    iframe.style.height = '250px';
    iframe.style.border = '1px solid #ddd';
    iframe.style.borderRadius = '4px';
    
    // Clear previous content and add iframe
    statusElement.innerHTML = '';
    statusElement.appendChild(iframe);
    
    // Listen for messages from iframe
    window.addEventListener('message', function pingIframeHandler(event) {
      if (event.data && event.data.type === 'ping-iframe-ready') {
        // Iframe loaded successfully
        console.log('Ping iframe loaded');
      }
    });
    
  } catch (error) {
    statusElement.className = 'status error';
    statusElement.innerHTML = `Error: ${error.message}`;
  } finally {
    pingBtn.disabled = false;
  }
}

// Function to load received webhooks
async function loadReceivedWebhooks() {
  try {
    const response = await fetch('/api/received');
    const data = await response.json();
    updateReceivedWebhooks(data);
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