// PeerIDを xxx-xx-xxxx 形式で生成
function generateId() {
  const part1 = Math.floor(Math.random() * 900) + 100;
  const part2 = Math.floor(Math.random() * 90) + 10;
  const part3 = Math.floor(Math.random() * 9000) + 1000;
  return `${part1}-${part2}-${part3}`;
}

const myId = generateId();
const peer = new Peer(myId);

document.getElementById('my-id').textContent = myId;

let call = null;
let localStream = null;

// 相手から呼び出された時
peer.on('call', incomingCall => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    localStream = stream;
    // PTT用に音声トラックを最初は停止
    localStream.getAudioTracks()[0].enabled = false;
    incomingCall.answer(localStream);
    incomingCall.on('stream', remoteStream => {
      document.getElementById('remoteAudio').srcObject = remoteStream;
    });
  });
});

// PTTボタン
const talkBtn = document.getElementById('talk-btn');

talkBtn.addEventListener('mousedown', async () => {
  const peerId = document.getElementById('peer-id').value;
  if (!peerId) return alert("相手のIDを入力してください");

  if (!call) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream = stream;
    localStream.getAudioTracks()[0].enabled = true; // PTT開始
    call = peer.call(peerId, localStream);
    call.on('stream', remoteStream => {
      document.getElementById('remoteAudio').srcObject = remoteStream;
    });
  } else {
    // 既存通話の場合はトラックをON
    localStream.getAudioTracks()[0].enabled = true;
  }
});

talkBtn.addEventListener('mouseup', () => {
  if (localStream) localStream.getAudioTracks()[0].enabled = false; // PTT終了
});
