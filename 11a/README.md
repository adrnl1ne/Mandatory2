# React Firebase Authentication App

## Overview
A React application demonstrating user authentication functionality using Firebase. This application includes login, signup, and protected routes to control access to authenticated content.

## Project Structure
```
/public           # Static assets and HTML template
/src              # Application source code
    /components     # React components
        Dashboard.js      # User dashboard (protected route)
        Login.js          # User login form
        ProtectedRoute.js # Route protection component
        SignUp.js         # User registration form
    firebase.js     # Firebase configuration and setup
    App.js          # Main application component
```

## Features
- User registration with email and password
- User login with email and password
- Protected routes accessible only to authenticated users
- User dashboard for authenticated users
- Responsive design

## Getting Started

### Prerequisites
- Node.js and npm installed
- Firebase account and project

### Firebase Setup
1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password method
3. Copy your Firebase configuration (available in Project Settings)
4. Update the configuration in `src/firebase.js`:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

### Installation
1. Clone the repository
2. Install dependencies:
     ```bash
     npm install
     ```
3. Configure Firebase: Edit `src/firebase.js` with your Firebase project configuration

### Running the Application
Start the development server:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage
- Register a new account using the Sign Up page
- Log in with your credentials
- Access the Dashboard (protected route)
- Log out when finished

## Application Flow
- Unauthenticated users can only access the Login and Sign Up pages
- The `ProtectedRoute` component prevents unauthorized access to the Dashboard
- Upon successful login, users are redirected to the Dashboard
- Logging out returns users to the Login page

## Available Scripts
- `npm start`: Run the app in development mode
- `npm test`: Launch the test runner
- `npm run build`: Build the app for production
- `npm run eject`: Eject from Create React App (one-way operation)