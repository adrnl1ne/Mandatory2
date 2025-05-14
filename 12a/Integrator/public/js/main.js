// Fetch configuration from the server
async function fetchConfig() {
  const response = await fetch('/api/config');
  const data = await response.json();
  
  // Update the UI with configuration
  document.getElementById('webhookServerUrl').href = data.webhookServer;
  document.getElementById('webhookServerUrl').textContent = data.webhookServer;
  document.getElementById('publicUrl').textContent = `${data.publicUrl}/webhook`;
}

// Check status on page load
async function checkWebhookStatus() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    
    // Display registered webhook
    if (data.registered) {
      document.getElementById('webhookInfo').className = '';
      document.getElementById('webhookDetails').textContent = JSON.stringify(data.webhook, null, 2);
    } else {
      document.getElementById('webhookInfo').className = 'hidden';
    }
    
    // Display received webhooks
    if (data.received && data.received.length > 0) {
      document.getElementById('noWebhooks').style.display = 'none';
      
      const webhooksHtml = data.received.map((webhook, index) => {
        // Safely handle potentially missing data
        const eventType = webhook.event_type || 'Unknown';
        const timestamp = webhook.timestamp ? new Date(webhook.timestamp).toLocaleString() : 'Unknown time';
        
        // Safely stringify data, handling null or undefined
        let dataJson = 'No data';
        try {
          if (webhook.data) {
            dataJson = JSON.stringify(webhook.data, null, 2);
          }
        } catch (err) {
          dataJson = 'Error displaying data';
        }
        
        return `
          <div class="card">
            <h4>Webhook #${index + 1}</h4>
            <p><strong>Event:</strong> ${eventType}</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Data:</strong></p>
            <pre>${dataJson}</pre>
          </div>
        `;
      }).join('');
      
      document.getElementById('receivedWebhooks').innerHTML = webhooksHtml;
    } else {
      document.getElementById('noWebhooks').style.display = 'block';
      document.getElementById('receivedWebhooks').innerHTML = '';
    }
  } catch (error) {
    console.error('Error checking webhook status:', error);
  }
}

// Initialize the page
async function initPage() {
  await fetchConfig();
  await checkWebhookStatus();
  
  // Register webhook button
  document.getElementById('registerBtn').addEventListener('click', async () => {
    try {
      document.getElementById('registerStatus').innerHTML = 'Registering webhook...';
      document.getElementById('registerStatus').className = 'status';
      
      const response = await fetch('/api/register', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('registerStatus').innerHTML = '✅ ' + data.message;
        document.getElementById('registerStatus').className = 'status success';
        document.getElementById('webhookInfo').className = '';
        document.getElementById('webhookDetails').textContent = JSON.stringify(data.webhook, null, 2);
      } else {
        document.getElementById('registerStatus').innerHTML = '❌ ' + data.message;
        document.getElementById('registerStatus').className = 'status error';
      }
    } catch (error) {
      document.getElementById('registerStatus').innerHTML = '❌ Error: ' + error.message;
      document.getElementById('registerStatus').className = 'status error';
    }
  });
  
  // Ping webhook button
  document.getElementById('pingBtn').addEventListener('click', async () => {
    try {
      document.getElementById('pingStatus').innerHTML = 'Sending ping...';
      document.getElementById('pingStatus').className = 'status';
      
      const response = await fetch('/api/ping', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('pingStatus').innerHTML = '✅ ' + data.message;
        document.getElementById('pingStatus').className = 'status success';
        
        // Check for new webhooks after ping
        setTimeout(checkWebhookStatus, 2000);
      } else {
        document.getElementById('pingStatus').innerHTML = '❌ ' + data.message;
        document.getElementById('pingStatus').className = 'status error';
      }
    } catch (error) {
      document.getElementById('pingStatus').innerHTML = '❌ Error: ' + error.message;
      document.getElementById('pingStatus').className = 'status error';
    }
  });
  
  // Poll for updates every 5 seconds
  setInterval(checkWebhookStatus, 5000);
}

// Start the application when the page loads
window.addEventListener('DOMContentLoaded', initPage);