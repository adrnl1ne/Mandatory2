// Storage for webhooks using localStorage
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
    url: `${CONFIG.VERCEL_URL}/api/webhook`,
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
    
    // Display webhook details
    document.getElementById('webhookDetails').textContent = JSON.stringify(webhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
    
    // Store registered webhook
    localStorage.setItem('registeredWebhook', JSON.stringify(webhookData));
  } catch (error) {
    // Handle CORS and other errors
    statusElement.className = 'status';
    statusElement.innerHTML = `
      <p>Direct registration may not be possible due to browser security (CORS).</p>
      <p>Please register manually:</p>
      <ol>
        <li>Open <a href="${CONFIG.WEBHOOK_SERVER}/register" target="_blank">the webhook server</a></li>
        <li>Enter URL: <code>${CONFIG.VERCEL_URL}/api/webhook</code></li>
        <li>Select all event types</li>
        <li>Click "Register"</li>
      </ol>
    `;
    
    // Still show the webhook data
    document.getElementById('webhookDetails').textContent = JSON.stringify(webhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
  } finally {
    registerBtn.disabled = false;
  }
}

// Send ping function with fallback mechanism
async function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  try {
    pingBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = 'Sending ping...';
    statusElement.classList.remove('hidden');
    
    try {
      // Try to use our API endpoint
      const response = await fetch('/api/ping');
      
      if (response.ok) {
        const data = await response.json();
        
        statusElement.className = 'status success';
        statusElement.innerHTML = `
          <p>Ping sent successfully!</p>
          <p>Check below for any received webhooks in a few moments.</p>
        `;
        
        // Refresh webhooks after a short delay
        setTimeout(loadReceivedWebhooks, 2000);
        return;
      }
    } catch (apiError) {
      console.warn('API endpoint failed, using direct method:', apiError);
    }
    
    // Fallback: Open the ping URL directly in a new tab
    window.open(`${CONFIG.WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`, '_blank');
    
    // Show success message for fallback approach
    statusElement.className = 'status success';
    statusElement.innerHTML = `
      <p>Ping opened in a new tab.</p>
      <p>After completing verification (if needed), check below for received webhooks.</p>
      <p><button id="addDemoBtn" class="btn-sm">Add Demo Webhook</button></p>
    `;
    
    // Add event listener to the demo button
    setTimeout(() => {
      const demoBtn = document.getElementById('addDemoBtn');
      if (demoBtn) {
        demoBtn.addEventListener('click', addDemoWebhook);
      }
    }, 10);
    
  } catch (error) {
    statusElement.className = 'status error';
    statusElement.innerHTML = `Error: ${error.message}`;
  } finally {
    setTimeout(() => {
      pingBtn.disabled = false;
    }, 1000);
  }
}

// Add a demo webhook
function addDemoWebhook() {
  const newWebhook = {
    timestamp: new Date().toISOString(),
    data: {
      event: "ping_response",
      message: "This is a demonstration webhook",
      timestamp: new Date().toISOString(),
      payload: {
        status: "success",
        id: Math.random().toString(36).substring(2, 15),
        source: "webhook_server"
      }
    }
  };
  
  // Add to start of array
  receivedWebhooks.unshift(newWebhook);
  
  // Keep only last 5 webhooks
  if (receivedWebhooks.length > 5) {
    receivedWebhooks = receivedWebhooks.slice(0, 5);
  }
  
  // Save to localStorage
  saveWebhooks();
  
  // Update UI
  updateWebhooksUI();
}

// Clear all webhooks
function clearWebhooks() {
  receivedWebhooks = [];
  saveWebhooks();
  updateWebhooksUI();
}

// Fetch received webhooks from the API with fallback
async function loadReceivedWebhooks() {
  try {
    try {
      // Try to use the API first
      const response = await fetch('/api/received-webhooks');
      
      if (response.ok) {
        const webhooks = await response.json();
        
        if (webhooks && webhooks.length > 0) {
          receivedWebhooks = webhooks;
          saveWebhooks();
          updateWebhooksUI();
          return;
        }
      }
    } catch (apiError) {
      console.warn('API endpoint not available, using localStorage:', apiError);
    }
    
    // Fallback: Just use localStorage data (already loaded in init())
    updateWebhooksUI();
  } catch (error) {
    console.error('Error loading webhooks:', error);
  }
}

// Update UI with received webhooks
function updateWebhooksUI() {
  const webhooksContainer = document.getElementById('receivedWebhooks');
  const noWebhooksElement = document.getElementById('noWebhooks');
  
  if (receivedWebhooks.length > 0) {
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
  document.getElementById('publicUrl').textContent = `${CONFIG.VERCEL_URL}/api/webhook`;
  
  // Set up event listeners
  document.getElementById('registerBtn').addEventListener('click', registerWebhook);
  document.getElementById('pingBtn').addEventListener('click', sendPing);
  document.getElementById('simulateBtn').addEventListener('click', addDemoWebhook);
  document.getElementById('clearBtn').addEventListener('click', clearWebhooks);
  
  // Load received webhooks from the API
  loadReceivedWebhooks();
  
  // Show webhooks
  updateWebhooksUI();
  
  // Display registered webhook if exists
  const savedWebhook = localStorage.getItem('registeredWebhook');
  if (savedWebhook) {
    document.getElementById('webhookDetails').textContent = savedWebhook;
    document.getElementById('webhookInfo').classList.remove('hidden');
  }
  
  // Set up polling for webhook updates
  setInterval(loadReceivedWebhooks, 5000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);