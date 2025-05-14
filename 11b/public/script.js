// Get Stripe publishable key from the server
let stripe;
let elements;
let currentAmount;
let currentCurrency = 'usd';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch the publishable key from the server
    const { publishableKey } = await fetch('/config').then(r => r.json());
    stripe = Stripe(publishableKey);
    
    // Add event listeners to purchase buttons
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const amount = button.getAttribute('data-amount');
        showPaymentForm(amount);
      });
    });
    
    // Add event listener to payment form
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', handleSubmit);
    
  } catch (error) {
    console.error('Error initializing payment:', error);
    alert('Failed to initialize payment system. Please try again later.');
  }
});

// Function to display the payment form
function showPaymentForm(amount) {
  currentAmount = amount;
  document.getElementById('purchase-amount').textContent = `Amount: $${amount}`;
  
  // Display the payment form
  document.getElementById('payment-form-container').classList.remove('hidden');
  
  // Create card element if it doesn't exist
  if (!elements) {
    elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');
    
    // Handle card element errors
    cardElement.on('change', (event) => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }
  
  // Scroll to payment form
  document.getElementById('payment-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Function to handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  const submitButton = document.getElementById('submit-button');
  const spinner = document.getElementById('spinner');
  const buttonText = document.getElementById('button-text');
  
  // Disable the submit button and show spinner
  submitButton.disabled = true;
  spinner.classList.remove('hidden');
  buttonText.classList.add('hidden');
  
  try {
    // Create a payment intent on the server
    const response = await fetch('/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount: currentAmount,
        currency: currentCurrency
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    const data = await response.json();
    
    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement('card')
      }
    });
    
    if (error) {
      // Show error message
      showPaymentResult('failed', error.message);
    } else if (paymentIntent.status === 'succeeded') {
      // Payment successful
      showPaymentResult('succeeded', 'Your payment was successful! Thank you for your purchase.');
    } else {
      // Other status
      showPaymentResult('pending', `Payment status: ${paymentIntent.status}`);
    }
    
  } catch (error) {
    console.error('Payment error:', error);
    showPaymentResult('failed', 'An unexpected error occurred. Please try again.');
  }
  
  // Re-enable the submit button
  submitButton.disabled = false;
  spinner.classList.add('hidden');
  buttonText.classList.remove('hidden');
}

// Function to display payment result
function showPaymentResult(status, message) {
  const paymentForm = document.getElementById('payment-form');
  const paymentResult = document.getElementById('payment-result');
  const paymentStatus = document.getElementById('payment-status');
  const paymentMessage = document.getElementById('payment-message');
  
  // Hide the form
  paymentForm.classList.add('hidden');
  
  // Show the result
  paymentResult.classList.remove('hidden');
  
  if (status === 'succeeded') {
    paymentStatus.textContent = 'Successful';
    paymentStatus.className = 'success';
  } else {
    paymentStatus.textContent = 'Failed';
    paymentStatus.className = 'error';
  }
  
  paymentMessage.textContent = message;
}