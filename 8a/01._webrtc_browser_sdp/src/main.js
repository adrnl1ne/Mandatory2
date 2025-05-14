import './style.css';

let localstream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302'],
    }
  ]
};

async function init() {
  localstream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById('localVideo').srcObject = localstream;
}

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

async function createOffer() {
  if (!localstream) {
    return alert('Local stream is not ready');
  }

  const offer = await createPeerConnection("sdpOfferTextArea");

  await peerConnection.setLocalDescription(offer);
}

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

init();
document.getElementById('createOfferButton').addEventListener('click', createOffer);
document.getElementById('createAnswerButton').addEventListener('click', createAnswer);
document.getElementById('addAnswerButton').addEventListener('click', addAnswer);