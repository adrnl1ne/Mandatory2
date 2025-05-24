// Storage for webhooks using localStorage as fallback
let receivedWebhooks = [];

// Load webhooks from local storage (fallback)
function loadStoredWebhooks() {
  try {
    const storedWebhooks = localStorage.getItem('receivedWebhooks');
    if (storedWebhooks) {
      receivedWebhooks = JSON.parse(storedWebhooks);
    }
  } catch (e) {
    console.error('Error loading webhooks from storage:', e);
  }
}

// Save webhooks to localStorage (fallback)
function saveWebhooks() {
  try {
    localStorage.setItem('receivedWebhooks', JSON.stringify(receivedWebhooks));
  } catch (e) {
    console.error('Error saving webhooks:', e);
  }
}

// Register webhook function
async function registerWebhook() {
  const registerBtn = document.getElementById('registerBtn');
  const statusElement = document.getElementById('registerStatus');
  
  registerBtn.disabled = true;
  statusElement.className = 'status';
  statusElement.innerHTML = 'Registering webhook...';
  statusElement.classList.remove('hidden');
  
  // Create webhook data
  const webhookData = {
    url: `${CONFIG.VERCEL_URL}/webhook`,
    events: ["*"],
    description: "Webhook integrator endpoint"
  };
  
  try {
    // Try to register directly with webhook server
    const response = await fetch(`${CONFIG.WEBHOOK_SERVER}/register-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    
    // Get response
    const data = await response.json();
    
    // Show success
    statusElement.className = 'status success';
    statusElement.innerHTML = 'Webhook registered successfully!';
    
    // Format the response data nicely with additional details from our request
    const fullWebhookData = {
      ...data,
      url: webhookData.url,
      description: webhookData.description,
      registered_at: new Date().toISOString()
    };
    
    // Display webhook details
    document.getElementById('webhookDetails').textContent = JSON.stringify(fullWebhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
    
    // Store registered webhook with all details
    localStorage.setItem('registeredWebhook', JSON.stringify(fullWebhookData));
  } catch (error) {
    // Handle CORS and other errors
    statusElement.className = 'status';
    statusElement.innerHTML = `
      <p>Direct registration may not be possible due to browser security (CORS).</p>
      <p>Please register manually:</p>
      <ol>
        <li>Open <a href="${CONFIG.WEBHOOK_SERVER}/register" target="_blank">the webhook server</a></li>
        <li>Enter URL: <code>${CONFIG.VERCEL_URL}/webhook</code></li>
        <li>Select all event types</li>
        <li>Click "Register"</li>
      </ol>
    `;
    
    // Still show the webhook data
    document.getElementById('webhookDetails').textContent = JSON.stringify(webhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
    
    // Store basic webhook data
    localStorage.setItem('registeredWebhook', JSON.stringify(webhookData));
  } finally {
    registerBtn.disabled = false;
  }
}

// Send ping function - NO REDIRECT
async function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  pingBtn.disabled = true;
  statusElement.className = 'status';
  statusElement.innerHTML = 'Sending ping...';
  statusElement.classList.remove('hidden');
  
  try {
    const response = await fetch('/api/ping');
    const data = await response.json();
    
    if (data.success) {
      statusElement.className = 'status success';
      statusElement.innerHTML = `
        <p>Ping sent successfully!</p>
        <p>Check below for received webhooks in a few moments.</p>
      `;
      
      // Check for webhooks multiple times after ping
      setTimeout(loadReceivedWebhooks, 1000);
      setTimeout(loadReceivedWebhooks, 3000);
      setTimeout(loadReceivedWebhooks, 6000);
    } else {
      throw new Error(data.message || 'Failed to send ping');
    }
  } catch (error) {
    console.error('Error sending ping:', error);
    
    statusElement.className = 'status error';
    statusElement.innerHTML = `
      <p>Error: ${error.message}</p>
      <p>Trying fallback method...</p>
    `;
    
    // Fallback to opening in a new tab with target=_blank
    setTimeout(() => {
      window.open(`${CONFIG.WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`, '_blank');
      
      statusElement.className = 'status';
      statusElement.innerHTML = `
        <p>Ping request opened in new tab.</p>
        <p>Check for webhooks below shortly.</p>
      `;
      
      // Try to load webhooks after some time
      setTimeout(loadReceivedWebhooks, 2000);
      setTimeout(loadReceivedWebhooks, 5000);
    }, 1000);
  } finally {
    setTimeout(() => {
      pingBtn.disabled = false;
    }, 2000);
  }
}

// Clear all webhooks
function clearWebhooks() {
  receivedWebhooks = [];
  saveWebhooks();
  updateWebhooksUI();
}

// Load received webhooks from the server
async function loadReceivedWebhooks() {
  try {
    const response = await fetch('/api/received-webhooks');
    
    if (response.ok) {
      const webhooks = await response.json();
      
      // If we got real webhooks from the server, use them
      if (Array.isArray(webhooks) && webhooks.length > 0) {
        receivedWebhooks = webhooks;
        saveWebhooks(); // Save to localStorage as backup
      }
      
      // Update the UI
      updateWebhooksUI();
    }
  } catch (error) {
    console.error('Error loading webhooks:', error);
    // Just use the local data we have
    updateWebhooksUI();
  }
}

// Load registered webhooks from the webhook server
async function loadRegisteredWebhooks() {
  try {
    // Check if we have a cached webhook registration first
    const savedWebhook = localStorage.getItem('registeredWebhook');
    if (savedWebhook) {
      // Display the stored webhook details
      document.getElementById('webhookDetails').textContent = savedWebhook;
      document.getElementById('webhookInfo').classList.remove('hidden');
      
      // Try to verify it still exists on the webhook server
      try {
        // Query the webhook server using the CONFIG.WEBHOOK_SERVER URL
        const response = await fetch(`${CONFIG.WEBHOOK_SERVER}/webhooks?url=${encodeURIComponent(`${CONFIG.VERCEL_URL}/webhook`)}`);
        
        if (response.ok) {
          const webhooks = await response.json();
          if (webhooks && webhooks.length > 0) {
            // Update with fresh data from server
            document.getElementById('webhookDetails').textContent = JSON.stringify(webhooks[0], null, 2);
            localStorage.setItem('registeredWebhook', JSON.stringify(webhooks[0]));
          }
        }
      } catch (verifyError) {
        console.warn('Could not verify webhook with server:', verifyError);
        // Continue using local data, no need to inform user
      }
    }
  } catch (error) {
    console.error('Error loading registered webhooks:', error);
    
    // Still try to display from localStorage if available
    const savedWebhook = localStorage.getItem('registeredWebhook');
    if (savedWebhook) {
      document.getElementById('webhookDetails').textContent = savedWebhook;
      document.getElementById('webhookInfo').classList.remove('hidden');
    }
  }
}

// Update UI with received webhooks
function updateWebhooksUI() {
  const webhooksContainer = document.getElementById('receivedWebhooks');
  const noWebhooksElement = document.getElementById('noWebhooks');
  
  if (receivedWebhooks && receivedWebhooks.length > 0) {
    noWebhooksElement.classList.add('hidden');
    webhooksContainer.innerHTML = '';
    
    receivedWebhooks.forEach((webhook, index) => {
      const webhookElement = document.createElement('div');
      webhookElement.className = 'webhook-card';
      
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
function init() {
  // Load stored webhooks
  loadStoredWebhooks();
  
  // Update UI with config values
  document.getElementById('webhookServerUrl').href = CONFIG.WEBHOOK_SERVER;
  document.getElementById('webhookServerUrl').textContent = CONFIG.WEBHOOK_SERVER;
  document.getElementById('publicUrl').textContent = `${CONFIG.VERCEL_URL}/webhook`;
  
  // Set up event listeners
  document.getElementById('registerBtn').addEventListener('click', registerWebhook);
  document.getElementById('pingBtn').addEventListener('click', sendPing);
  document.getElementById('clearBtn').addEventListener('click', clearWebhooks);
  
  // Load webhooks data 
  loadReceivedWebhooks();
  loadRegisteredWebhooks();
  
  // Set up polling for webhook updates
  setInterval(loadReceivedWebhooks, 5000);
  setInterval(loadRegisteredWebhooks, 30000); // Check registered webhooks less frequently
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);