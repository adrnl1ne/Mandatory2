import './style.css';

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_TOKEN,
  authDomain: "webrtc-dc295.firebaseapp.com",
  projectId: "webrtc-dc295",
  storageBucket: "webrtc-dc295.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "967549457557",
  appId: "1:967549457557:web:0aeffadc33718a0a89b79c"
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();


// HTML elements
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");


// Global state
const GLOBAL_CALL_ID = "GLOBAL_CALL_ID";
let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
      {
          urls: ['stun:stun1.l.google.com:19302'],
      }
  ]
};

async function startCall() {
  // Firestore
  const callDocument = firestore.collection('calls').doc(GLOBAL_CALL_ID);
  const offerCandidates = callDocument.collection('offerCandidates');
  const answerCandidates = callDocument.collection('answerCandidates');

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  peerConnection = new RTCPeerConnection(servers);

localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

peerConnection.ontrack = (event) => {
  event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
};

peerConnection.onicecandidate = (event) => {
  event.candidate && offerCandidates.add(event.candidate.toJSON());
};

const offerDescription = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offerDescription);

await callDocument.set({ offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

callDocument.onSnapshot((snapshot) => {
  const data = snapshot.data();
  if (!peerConnection.currentRemoteDescription && data?.answer) {
    const answerDescription = new RTCSessionDescription(data.answer);
    peerConnection.setRemoteDescription(answerDescription);
  }
});

answerCandidates.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const candidate = new RTCIceCandidate(change.doc.data());
      if (peerConnection.remoteDescription) {
        peerConnection.addIceCandidate(candidate);
      }
    }
  });
});
}


async function answerCall() {
  try {
    const callDocument = firestore.collection("calls").doc(GLOBAL_CALL_ID);
    const offerCandidates = callDocument.collection("offerCandidates");
    const answerCandidates = callDocument.collection("answerCandidates");

    // Get the call snapshot first to check if there's an offer
    const callSnapshot = await callDocument.get();
    if (!callSnapshot.exists || !callSnapshot.data()?.offer) {
      alert("No call to answer. Please wait for someone to start a call first.");
      console.error("No offer found.");
      return;
    }

    // Create peer connection
    peerConnection = new RTCPeerConnection(servers);

    // Set up local media stream
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Changed to include audio
    localVideo.srcObject = localStream;

    // Set up remote stream
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;

    // Add local tracks to peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    // Listen for remote tracks
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    // Send ice candidates to firestore
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        answerCandidates.add(event.candidate.toJSON());
      }
    };

    // Set remote description from the offer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(callSnapshot.data().offer));

    // Create and set local description
    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);
    
    // Update the document with the answer
    await callDocument.update({ 
      answer: { 
        type: answerDescription.type, 
        sdp: answerDescription.sdp 
      } 
    });

    // Listen for new ICE candidates from the offer side
    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate).catch(err => {
            console.error("Error adding ICE candidate:", err);
          });
        }
      });
    });

    console.log("Call answered successfully!");
  } catch (error) {
    console.error("Error answering call:", error);
    alert("Failed to answer call: " + error.message);
  }
}

document.getElementById("startCall").addEventListener("click", startCall);
document.getElementById("answerCall").addEventListener("click", answerCall);