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

// Improved ping function with server-side proxy
async function sendPing() {
  const pingBtn = document.getElementById('pingBtn');
  const statusElement = document.getElementById('pingStatus');
  
  try {
    pingBtn.disabled = true;
    statusElement.className = 'status';
    statusElement.innerHTML = 'Sending ping...';
    statusElement.classList.remove('hidden');
    
    // Create ping proxy iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'iframe-container';
    
    const proxyFrame = document.createElement('iframe');
    proxyFrame.style.display = 'none';
    proxyFrame.name = 'pingProxy';
    iframeContainer.appendChild(proxyFrame);
    
    // Create a form to submit through the iframe
    const form = document.createElement('form');
    form.target = 'pingProxy';
    form.method = 'GET';
    form.action = '/api/ping-proxy';
    
    // Add the form to the container
    iframeContainer.appendChild(form);
    
    // Add the container to the page
    document.body.appendChild(iframeContainer);
    
    // Submit the form
    form.submit();
    
    // Setup message listener for communication from the iframe
    window.addEventListener('message', function pingHandler(event) {
      // Only handle messages from our proxy
      if (event.data && event.data.type === 'ping-result') {
        // Remove the event listener to avoid memory leaks
        window.removeEventListener('message', pingHandler);
        
        // Process the result
        if (event.data.success) {
          statusElement.className = 'status success';
          statusElement.innerHTML = 'Ping sent successfully!';
          
          // Refresh received webhooks after a delay
          setTimeout(loadReceivedWebhooks, 1000);
        } else {
          statusElement.className = 'status error';
          statusElement.innerHTML = `Error: ${event.data.error || 'Failed to send ping'}`;
        }
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframeContainer);
        }, 1000);
      }
    });
    
    // Set a timeout to handle case where we don't get a response
    setTimeout(() => {
      statusElement.innerHTML += '<br>Still waiting for ping response...';
      statusElement.innerHTML += '<br>The first ping may require manual approval in the iframe.';
    }, 3000);
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