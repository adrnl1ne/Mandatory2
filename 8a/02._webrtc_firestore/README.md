# WebRTC Firestore Video Chat Documentation

## Overview

This application is a simple peer-to-peer video chat using WebRTC technology with Firebase Firestore for signaling. It allows two users to establish a direct video connection through their browsers with real-time audio and video streaming.

---

## Technologies Used

- **WebRTC API** for peer-to-peer communication  
- **Firebase Firestore** for signaling and connection establishment  
- **JavaScript** for application logic  
- **HTML/CSS** for user interface  

---

## Setup Instructions

### Prerequisites

- Node.js and npm installed  
- Firebase account with a project set up  
- Modern web browser with WebRTC support  

### Installation

1. **Clone the repository**
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Configure Firebase:**  
    Update the Firebase configuration in `main.js` with your own Firebase project details:
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
4. **Configure STUN server:**  
    Add the following configuration for ICE servers in `main.js`:
    ```javascript
    const servers = {
      iceServers: [
         {
            urls: ['stun:stun1.l.google.com:19302'],
         }
      ]
    };
    ```
5. **Run the development server**

---

## How It Works

### WebRTC Connection Flow

#### Signaling with Firebase

- The application uses a shared Firestore document with a global ID for signaling.
- SDP (Session Description Protocol) offers and answers are exchanged through this document.
- ICE candidates are stored in subcollections.

#### Connection Process

1. **User 1** clicks "Start Call" to create an offer and store it in Firestore.
2. **User 2** clicks "Answer Call" to retrieve the offer, create an answer, and store it back.
3. Both peers exchange ICE candidates through Firestore collections.
4. When the connection is established, video and audio stream directly between browsers.

---

## Key Components

### HTML Structure

- Two video elements for local and remote video feeds
- Two buttons for starting and answering calls

### JavaScript Functions

- `startCall()`: Initializes local media stream, creates and sends an offer
- `answerCall()`: Receives an offer, creates and sends an answer

### Firebase Integration

- Uses Firestore to store and retrieve signaling data
- Listens for real-time updates to SDP offers/answers and ICE candidates

---

## Usage Instructions

### For the First User (Caller)

1. Open the application in your browser
2. Grant camera and microphone permissions when prompted
3. Click the **"Start Call"** button
4. Wait for the second user to join

### For the Second User (Receiver)

1. Open the application in another browser tab or on another device
2. Click the **"Answer Call"** button
3. Grant camera and microphone permissions when prompted
4. The connection should establish automatically

---

## Notes

- Both users must have access to the same Firebase project
- The application uses a hardcoded global call ID (`GLOBAL_CALL_ID`), so it supports only one active call at a time
- For production use, implement user authentication and dynamic call IDs

---

## Technical Implementation Details

### STUN Server Configuration

The application uses Google's public STUN server for NAT traversal:

```javascript
const servers = {
  iceServers: [
     {
        urls: ['stun:stun1.l.google.com:19302'],
     }
  ]
};
```

### Media Constraints

The application requests both video and audio:

```javascript
localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

### Responsive Design

The CSS includes responsive design features that adapt to different screen sizes, ensuring the application works well on mobile devices.