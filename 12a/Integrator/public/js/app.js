// Storage for webhooks using localStorage as fallback
let receivedWebhooks = [];

// Client-side logging function
function log(area, message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[CLIENT] [${timestamp}] [${area}] ${message}`);
  if (data) {
    console.log(data);
  }
}

log('INIT', 'Loading app.js');

// Load webhooks from local storage (fallback)
function loadStoredWebhooks() {
  log('STORAGE', 'Loading webhooks from localStorage');
  try {
    const storedWebhooks = localStorage.getItem('receivedWebhooks');
    if (storedWebhooks) {
      receivedWebhooks = JSON.parse(storedWebhooks);
      log('STORAGE', `Loaded ${receivedWebhooks.length} webhooks`);
    } else {
      log('STORAGE', 'No stored webhooks found');
    }
  } catch (e) {
    log('ERROR', 'Error loading webhooks from storage:', e);
  }
}

// Save webhooks to localStorage (fallback)
function saveWebhooks() {
  log('STORAGE', `Saving ${receivedWebhooks.length} webhooks to localStorage`);
  try {
    localStorage.setItem('receivedWebhooks', JSON.stringify(receivedWebhooks));
    log('STORAGE', 'Webhooks saved successfully');
  } catch (e) {
    log('ERROR', 'Error saving webhooks:', e);
  }
}

// Register webhook function
async function registerWebhook() {
  log('REGISTER', 'Register webhook button clicked');
  const registerBtn = document.getElementById('registerBtn');
  const statusElement = document.getElementById('registerStatus');
  
  registerBtn.disabled = true;
  statusElement.className = 'status';
  statusElement.innerHTML = 'Registering webhook...';
  statusElement.classList.remove('hidden');
  
  // Get the webhook URL based on your environment configuration
  // Make sure not to include the /webhook part twice
  const baseUrl = CONFIG.VERCEL_URL.endsWith('/webhook') 
    ? CONFIG.VERCEL_URL 
    : `${CONFIG.VERCEL_URL}/webhook`;
  
  log('REGISTER', `Using webhook URL: ${baseUrl}`);
  
  // Create webhook data
  const webhookData = {
    url: baseUrl,
    events: ["*"],
    description: "Webhook integrator endpoint"
  };
  
  log('REGISTER', 'Webhook data created', webhookData);
  
  try {
    log('REGISTER', 'Sending registration request to webhook server');
    // Try to register directly with webhook server
    const response = await fetch(`${CONFIG.WEBHOOK_SERVER}/register-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });
    
    log('REGISTER', `Registration response status: ${response.status}`);
    
    // Get response
    const data = await response.json();
    log('REGISTER', 'Registration response data:', data);
    
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
    
    log('REGISTER', 'Full webhook data:', fullWebhookData);
    
    // Display webhook details
    document.getElementById('webhookDetails').textContent = JSON.stringify(fullWebhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
    
    // Store registered webhook with all details
    localStorage.setItem('registeredWebhook', JSON.stringify(fullWebhookData));
    log('STORAGE', 'Registered webhook saved to localStorage');
  } catch (error) {
    log('ERROR', 'Registration error:', error);
    
    // Handle CORS and other errors
    statusElement.className = 'status';
    statusElement.innerHTML = `
      <p>Direct registration may not be possible due to browser security (CORS).</p>
      <p>Please register manually:</p>
      <ol>
        <li>Open <a href="${CONFIG.WEBHOOK_SERVER}/register" target="_blank">the webhook server</a></li>
        <li>Enter URL: <code>${webhookData.url}</code></li>
        <li>Select all event types</li>
        <li>Click "Register"</li>
      </ol>
    `;
    
    // Still show the webhook data
    document.getElementById('webhookDetails').textContent = JSON.stringify(webhookData, null, 2);
    document.getElementById('webhookInfo').classList.remove('hidden');
    
    // Store basic webhook data
    localStorage.setItem('registeredWebhook', JSON.stringify(webhookData));
    log('STORAGE', 'Basic webhook data saved to localStorage');
  } finally {
    registerBtn.disabled = false;
  }
}

// Send ping function - NO REDIRECT
async function sendPing() {
  log('PING', 'Send ping button clicked');
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  pingBtn.disabled = true;
  statusElement.className = 'status';
  statusElement.innerHTML = 'Sending ping...';
  statusElement.classList.remove('hidden');
  
  try {
    log('PING', 'Sending ping request to API endpoint');
    const response = await fetch('/api/ping');
    log('PING', `Ping response status: ${response.status}`);
    
    const data = await response.json();
    log('PING', 'Ping response data:', data);
    
    if (data.success) {
      log('PING', 'Ping successful');
      statusElement.className = 'status success';
      statusElement.innerHTML = `
        <p>Ping sent successfully!</p>
        <p>Check below for received webhooks in a few moments.</p>
      `;
      
      // Check for webhooks multiple times after ping
      log('PING', 'Setting up webhook checks');
      setTimeout(() => {
        log('PING', 'Checking for webhooks (1st attempt)');
        loadReceivedWebhooks();
      }, 1000);
      
      setTimeout(() => {
        log('PING', 'Checking for webhooks (2nd attempt)');
        loadReceivedWebhooks();
      }, 3000);
      
      setTimeout(() => {
        log('PING', 'Checking for webhooks (3rd attempt)');
        loadReceivedWebhooks();
      }, 6000);
    } else {
      log('PING', 'Ping failed:', data.message);
      throw new Error(data.message || 'Failed to send ping');
    }
  } catch (error) {
    log('ERROR', 'Ping error:', error);
    
    statusElement.className = 'status error';
    statusElement.innerHTML = `
      <p>Error: ${error.message}</p>
      <p>Trying fallback method...</p>
    `;
    
    // Fallback to opening in a new tab with target=_blank
    log('PING', 'Using fallback method (new tab)');
    setTimeout(() => {
      const pingUrl = `${CONFIG.WEBHOOK_SERVER}/ping?from=integrator&t=${Date.now()}`;
      log('PING', `Opening ping URL in new tab: ${pingUrl}`);
      
      window.open(pingUrl, '_blank');
      
      statusElement.className = 'status';
      statusElement.innerHTML = `
        <p>Ping request opened in new tab.</p>
        <p>Check for webhooks below shortly.</p>
      `;
      
      // Try to load webhooks after some time
      log('PING', 'Setting up fallback webhook checks');
      setTimeout(() => {
        log('PING', 'Checking for webhooks (fallback 1st attempt)');
        loadReceivedWebhooks();
      }, 2000);
      
      setTimeout(() => {
        log('PING', 'Checking for webhooks (fallback 2nd attempt)');
        loadReceivedWebhooks();
      }, 5000);
    }, 1000);
  } finally {
    setTimeout(() => {
      pingBtn.disabled = false;
      log('PING', 'Re-enabled ping button');
    }, 2000);
  }
}

// Clear all webhooks
function clearWebhooks() {
  log('CLEAR', 'Clear webhooks button clicked');
  receivedWebhooks = [];
  saveWebhooks();
  updateWebhooksUI();
  log('CLEAR', 'Webhooks cleared');
}

// Load received webhooks from the server with enhanced logging
async function loadReceivedWebhooks() {
  log('LOAD', 'Loading received webhooks from API');
  try {
    // Log URL being fetched
    const url = '/api/received-webhooks';
    log('FETCH', `Fetching from: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    log('FETCH', `Fetch completed in ${endTime - startTime}ms`);
    log('LOAD', `API response status: ${response.status}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      log('RESPONSE', `Content-Type: ${contentType}`);
      
      const webhooks = await response.json();
      log('LOAD', `Received ${webhooks.length} webhooks from API`);
      
      if (webhooks.length > 0) {
        log('DEBUG', 'First webhook:', webhooks[0]);
      }
      
      // If we got real webhooks from the server, use them
      if (Array.isArray(webhooks) && webhooks.length > 0) {
        receivedWebhooks = webhooks;
        log('LOAD', 'Updated webhooks with API data');
        saveWebhooks(); // Save to localStorage as backup
      } else {
        log('LOAD', 'No webhooks received from API');
      }
      
      // Update the UI
      updateWebhooksUI();
    } else {
      log('LOAD', `Failed to load webhooks: ${response.statusText}`);
    }
  } catch (error) {
    log('ERROR', 'Error loading webhooks:', error);
    log('LOAD', 'Using local data instead');
    // Just use the local data we have
    updateWebhooksUI();
  }
}

// Load registered webhooks from the webhook server
async function loadRegisteredWebhooks() {
  log('REGISTRY', 'Loading registered webhook info');
  try {
    // Check if we have a cached webhook registration first
    const savedWebhook = localStorage.getItem('registeredWebhook');
    if (savedWebhook) {
      log('REGISTRY', 'Found saved webhook in localStorage');
      try {
        // Try to parse the saved webhook properly
        const webhookData = JSON.parse(savedWebhook);
        log('REGISTRY', 'Parsed webhook data successfully', webhookData);
        
        // Display the stored webhook details
        document.getElementById('webhookDetails').textContent = JSON.stringify(webhookData, null, 2);
        document.getElementById('webhookInfo').classList.remove('hidden');
      } catch (parseError) {
        log('ERROR', 'Error parsing saved webhook:', parseError);
        
        // Try to display it as is
        document.getElementById('webhookDetails').textContent = savedWebhook;
        document.getElementById('webhookInfo').classList.remove('hidden');
      }
      
      // Only try to verify if explicitly requested
      if (arguments[0] === 'verify') {
        try {
          log('REGISTRY', 'Verifying webhook registration with server');
          
          // Query the webhook server using the CONFIG.WEBHOOK_SERVER URL
          const baseUrl = CONFIG.VERCEL_URL.endsWith('/webhook') 
            ? CONFIG.VERCEL_URL 
            : `${CONFIG.VERCEL_URL}/webhook`;
            
          const verifyUrl = `${CONFIG.WEBHOOK_SERVER}/webhooks?url=${encodeURIComponent(baseUrl)}`;
          log('REGISTRY', `Verification URL: ${verifyUrl}`);
          
          const response = await fetch(verifyUrl);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            log('REGISTRY', `Verify response content type: ${contentType}`);
            
            if (contentType && contentType.includes('application/json')) {
              const webhooks = await response.json();
              log('REGISTRY', 'Verification response:', webhooks);
              
              if (webhooks && webhooks.length > 0) {
                // Update with fresh data from server
                document.getElementById('webhookDetails').textContent = JSON.stringify(webhooks[0], null, 2);
                localStorage.setItem('registeredWebhook', JSON.stringify(webhooks[0]));
                log('REGISTRY', 'Updated webhook data from server verification');
              } else {
                log('REGISTRY', 'No registered webhooks found on server');
              }
            } else {
              log('REGISTRY', 'Server responded with non-JSON content');
            }
          } else {
            log('REGISTRY', `Verification failed: ${response.status} ${response.statusText}`);
          }
        } catch (verifyError) {
          log('ERROR', 'Could not verify webhook with server:', verifyError);
        }
      }
    } else {
      log('REGISTRY', 'No saved webhook found in localStorage');
    }
  } catch (error) {
    log('ERROR', 'Error loading registered webhooks:', error);
    
    // Still try to display from localStorage if available
    const savedWebhook = localStorage.getItem('registeredWebhook');
    if (savedWebhook) {
      log('REGISTRY', 'Falling back to raw localStorage data');
      try {
        document.getElementById('webhookDetails').textContent = JSON.stringify(JSON.parse(savedWebhook), null, 2);
      } catch (e) {
        document.getElementById('webhookDetails').textContent = savedWebhook;
      }
      document.getElementById('webhookInfo').classList.remove('hidden');
    }
  }
}

// Update UI with received webhooks
function updateWebhooksUI() {
  log('UI', `Updating UI with ${receivedWebhooks.length} webhooks`);
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
    
    log('UI', 'Updated UI with webhooks');
  } else {
    noWebhooksElement.classList.remove('hidden');
    webhooksContainer.innerHTML = '';
    log('UI', 'No webhooks to display');
  }
}

// Run the webhook self-test
async function testWebhook() {
  log('TEST', 'Test webhook button clicked');
  const statusElement = document.getElementById('pingStatus');
  
  statusElement.className = 'status';
  statusElement.innerHTML = 'Testing webhook reception...';
  statusElement.classList.remove('hidden');
  
  try {
    log('TEST', 'Calling test-webhook endpoint');
    const response = await fetch('/api/test-webhook');
    log('TEST', `Test response status: ${response.status}`);
    
    const data = await response.json();
    log('TEST', 'Test response data:', data);
    
    if (data.success) {
      statusElement.className = 'status success';
      statusElement.innerHTML = `
        <p>✅ Webhook test successful!</p>
        <p>The webhook was properly sent and received.</p>
      `;
      
      // Check for webhooks
      setTimeout(loadReceivedWebhooks, 1000);
    } else {
      statusElement.className = 'status error';
      statusElement.innerHTML = `
        <p>⚠️ Webhook test partially successful</p>
        <p>The webhook was sent, but was not found in received webhooks.</p>
        <p>This may indicate an issue with webhook storage or processing.</p>
      `;
    }
  } catch (error) {
    log('ERROR', 'Test webhook error:', error);
    
    statusElement.className = 'status error';
    statusElement.innerHTML = `
      <p>❌ Webhook test failed: ${error.message}</p>
      <p>There may be an issue with the webhook endpoint or serverless function.</p>
    `;
  }
}

// Initialize the page
function init() {
  log('INIT', 'Initializing application');
  
  // Load stored webhooks
  loadStoredWebhooks();
  
  // Update UI with config values
  log('CONFIG', 'Updating UI with configuration', CONFIG);
  document.getElementById('webhookServerUrl').href = CONFIG.WEBHOOK_SERVER;
  document.getElementById('webhookServerUrl').textContent = CONFIG.WEBHOOK_SERVER;
  
  // Properly format the webhook URL, avoiding double /webhook
  const webhookUrl = CONFIG.VERCEL_URL.endsWith('/webhook') 
    ? CONFIG.VERCEL_URL 
    : `${CONFIG.VERCEL_URL}/webhook`;
  
  document.getElementById('publicUrl').textContent = webhookUrl;
  log('CONFIG', `Using webhook URL: ${webhookUrl}`);
  
  // Set up event listeners
  log('INIT', 'Setting up event listeners');
  document.getElementById('registerBtn').addEventListener('click', registerWebhook);
  document.getElementById('pingBtn').addEventListener('click', sendPing);
  document.getElementById('clearBtn').addEventListener('click', clearWebhooks);
  
  // Add test webhook button listener
  if (document.getElementById('testWebhookBtn')) {
    document.getElementById('testWebhookBtn').addEventListener('click', testWebhook);
  }
  
  // Load webhooks data 
  log('INIT', 'Loading initial webhook data');
  loadReceivedWebhooks();
  loadRegisteredWebhooks();
  
  // Set up polling for webhook updates
  log('INIT', 'Setting up polling');
  setInterval(() => {
    log('POLL', 'Polling for webhook updates');
    loadReceivedWebhooks();
  }, 5000);
  
  log('INIT', 'Initialization complete');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  log('DOM', 'DOM content loaded, starting initialization');
  init();
});