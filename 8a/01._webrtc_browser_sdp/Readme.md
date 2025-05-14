# WebRTC Browser SDP - Implementation Documentation

## Project Overview

This project demonstrates peer-to-peer video communication between browsers using WebRTC technology. The application provides a simple video calling interface where users establish a connection by manually exchanging Session Description Protocol (SDP) offers and answers.

---

## Technologies Used

- **WebRTC API**: Real-time peer-to-peer communication
- **JavaScript**: Core application logic
- **HTML/CSS**: User interface
- **Vite**: Build tool and development server

---

## Architecture

The application follows a simple client-side architecture:

1. **Media Capture**: Accesses the user's camera and microphone
2. **Peer Connection**: Establishes WebRTC connections
3. **Signaling**: Manual exchange of SDP offers and answers
4. **Stream Handling**: Displays local and remote video streams

---

## Key Components

### 1. Media Stream Access

```javascript
async function init() {
    localstream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('localVideo').srcObject = localstream;
}
```
- Requests access to the user's camera and microphone
- Stores the media stream in a variable
- Sets the local video element's source to this stream

---

### 2. Peer Connection Setup

```javascript
const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302'],
        }
    ]
};

async function createPeerConnection(sdpOfferTextAreaId) {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById('remoteVideo').srcObject = remoteStream;

    localstream.getTracks().forEach((track) => peerConnection.addTrack(track, localstream));

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            document.getElementById(sdpOfferTextAreaId).textContent = JSON.stringify(peerConnection.localDescription);
        }
    };
}
```
- Creates a new `RTCPeerConnection` with STUN servers
- Sets up a remote `MediaStream` for receiving video
- Adds local tracks to the peer connection
- Handles incoming tracks from the remote peer
- Sets up ICE candidate handling to update the SDP in the textarea

---

### 3. Offer Creation

```javascript
async function createOffer() {
    if (!localstream) {
        return alert('Local stream is not ready');
    }

    const offer = await createPeerConnection("sdpOfferTextArea");

    await peerConnection.setLocalDescription(offer);
}
```
- Verifies that the local stream is available
- Creates a peer connection
- Sets the local description (offer)

---

### 4. Answer Creation

```javascript
async function createAnswer() {
    await createPeerConnection("sdpAnswerTextArea");

    let offer = document.getElementById('sdpOfferTextArea').value;
    if (!offer) {
        return alert('Offer is empty');
    }
    offer = JSON.parse(offer);

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    document.getElementById('sdpAnswerTextArea').textContent = JSON.stringify(answer);
}
```
- Creates a peer connection
- Reads and parses the SDP offer from the textarea
- Sets the remote description using the offer
- Creates an answer
- Sets the local description to the answer
- Displays the answer in the textarea

---

### 5. Answer Processing

```javascript
async function addAnswer() {
    let answer = document.getElementById('sdpAnswerTextArea').value;
    if (!answer) {
        return alert('Answer is empty');
    }
    answer = JSON.parse(answer);

    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
}
```
- Reads and parses the SDP answer from the textarea
- Sets the remote description using the answer if not already set

---

## UI Components

- Two video elements for local and remote video streams
- Three buttons: Create Offer, Create Answer, Add Answer
- Two textareas for displaying and entering SDP information

---

## STUN Server Configuration

The application uses Google's public STUN server (`stun:stun1.l.google.com:19302`) to facilitate NAT traversal.

---

## Usage Instructions

### Initial Setup

1. When the page loads, the application requests access to the camera and microphone.
2. The local video stream appears in the left video element.

### Creating a Connection (First User)

1. Click **"Create Offer"**.
2. The SDP offer appears in the first textarea.
3. Copy this offer and send it to the second user via any communication channel.

### Accepting a Connection (Second User)

1. Paste the received offer into the first textarea.
2. Click **"Create Answer"**.
3. The SDP answer appears in the second textarea.
4. Copy this answer and send it back to the first user.

### Completing the Connection (First User)

1. Paste the received answer into the second textarea.
2. Click **"Add Answer"**.
3. The connection is established, and video streams are exchanged.

---

## Limitations

- **Manual Signaling**: Requires manual exchange of SDP information
- **No TURN Support**: May not work across certain NATs and firewalls
- **Limited Error Handling**: Basic alerts for common errors
- **Single Connection**: Supports only one peer connection at a time

---

## Technical Considerations

- **Browser Compatibility**: Works in modern browsers that support WebRTC
- **Security**: Requires HTTPS in production environments for camera/microphone access
- **Bandwidth**: Video quality depends on network conditions
- **Privacy**: Users must grant permission for camera and microphone access

---

## Possible Enhancements

- Implement automated signaling using WebSockets or a signaling server
- Add TURN server support for better NAT traversal
- Implement connection state indicators
- Add options for controlling media quality
- Implement screen sharing capability
- Add text chat functionality alongside video

---

## Conclusion

This implementation provides a foundational understanding of WebRTC peer connections and the SDP exchange process. It demonstrates core WebRTC concepts without relying on external signaling services, making it an excellent educational tool for understanding the underlying mechanics of browser-based real-time communication.