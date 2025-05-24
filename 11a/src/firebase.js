// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_TOKEN,
  authDomain: "a-auth-integration.firebaseapp.com",
  projectId: "a-auth-integration",
  storageBucket: "a-auth-integration.firebasestorage.app", // Note: this should be a-auth-integration.appspot.com if not working
  messagingSenderId: "722812692787",
  appId: "1:722812692787:web:607dab24ebb15828ecb646",
  measurementId: "G-NGHJSQT9JP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;