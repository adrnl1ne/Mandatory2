// Updated firebase.js using environment variables
const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    // Parse the JSON string back to an object
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing Firebase credentials:', error);
    throw new Error('Invalid Firebase configuration');
  }
} else {
  // Fallback for local development
  serviceAccount = require('../firebase-key.json');
}

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { db };