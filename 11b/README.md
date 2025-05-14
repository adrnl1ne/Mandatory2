# Project Documentation

## Overview

This is a web application with a Node.js backend and a simple frontend. The application serves static files from a `public` directory and includes server-side functionality defined in `server.js`.

---

## Project Structure

```
.env         # Environment variables for configuration
.gitignore   # Specifies files to be ignored by Git
package.json # Node.js project configuration and dependencies
README.md    # Project information and documentation
server.js    # Main server application file
public/      # Directory containing static files
    ├─ index.html   # Main HTML page
    ├─ script.js    # Client-side JavaScript
    └─ styles.css   # CSS styling
```

---

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Stripe account (for payment processing)

### Installation

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file with required environment variables:**
   ```env
   PORT=3000
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

---

## Stripe Configuration

1. **Create a Stripe account at [stripe.com](https://stripe.com)**
2. **Navigate to the Stripe Dashboard → Developers → API keys**
3. **Copy your publishable key and secret key**
4. **Add these keys to your `.env` file**
5. **Install the Stripe package:**
   ```bash
   npm install stripe
   ```
6. **Configure Stripe in your server:**
   ```js
   // In server.js or a separate payments.js file
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   ```

7. **Example endpoint in `server.js`:**
   ```js
   app.get('/config', (req, res) => {
     res.json({
       publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
     });
   });
   ```

8. **Make your publishable key available to the frontend.**

9. **To test payments, use Stripe's test card numbers:**
   - Success card: `4242 4242 4242 4242`
   - Decline card: `4000 0000 0000 0002`

---

## Running the Application

- **Start the server:**
  ```bash
  node server.js
  ```
  or
  ```bash
  npm start
  ```
- **Open your browser and navigate to** `http://localhost:3000` **(or the port specified in your `.env` file).**

---

## Development

### Server-side

The `server.js` file contains the main application logic, likely using Express.js or a similar framework to:

- Serve static files from the `public` directory
- Handle API routes
- Process requests and responses
- Process payments via Stripe

### Client-side

- `index.html`: Structure of the web application
- `script.js`: Client-side functionality and interaction with the server
- `styles.css`: Visual styling of the application

---

## Payment Processing

To implement payment processing:

1. Create a payment form in your HTML
2. Use Stripe Elements or Checkout for secure payment collection
3. Submit payment information to your server
4. Process the payment using the Stripe API
5. Handle success and error responses

---

## Configuration

Environment variables are stored in the `.env` file and may include:

- Server port
- Database connection strings
- API keys (including Stripe keys)
- Other configuration parameters