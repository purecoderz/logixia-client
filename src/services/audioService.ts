// services/audioService.ts
const BASE = import.meta.env.VITE_AUDIO_URL ?? "https://audio.logixia.com.ng";
const ICE: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

let micStream: MediaStream | null = null;
let publisher: RTCPeerConnection | null = null;
const listeners = new Map<string, RTCPeerConnection>(); // one per speaker, keyed by path

// The whole WHIP/WHEP exchange: describe what I want, send it, apply the reply
async function exchange(pc: RTCPeerConnection, url: string) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: offer.sdp,
  });
  if (!res.ok) throw new Error(`Audio server answered ${res.status}`);

  await pc.setRemoteDescription({ type: "answer", sdp: await res.text() });
}

const AudioService = {
  async startMic(path: string) {
    AudioService.stopMic();

    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });

    const pc = new RTCPeerConnection({ iceServers: ICE });
    publisher = pc;
    micStream.getTracks().forEach((track) => pc.addTrack(track, micStream!));

    try {
      await exchange(pc, `${BASE}/${path}/whip`);
    } catch (err) {
      if (publisher === pc) AudioService.stopMic();
      throw err;
    }
  },

  stopMic() {
    publisher?.close();
    publisher = null;
    micStream?.getTracks().forEach((track) => track.stop());
    micStream = null;
  },

  async listen(
    path: string,
    onStream: (stream: MediaStream) => void,
    onState?: (state: RTCPeerConnectionState) => void,
  ) {
    AudioService.stopListening(path);

    const pc = new RTCPeerConnection({ iceServers: ICE });
    listeners.set(path, pc);

    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.ontrack = (event) => onStream(event.streams[0]);
    pc.onconnectionstatechange = () => {
      if (listeners.get(path) === pc) onState?.(pc.connectionState);
    };

    try {
      await exchange(pc, `${BASE}/${path}/whep`);
    } catch (err) {
      if (listeners.get(path) === pc) AudioService.stopListening(path);
      throw err;
    }
  },

  stopListening(path: string) {
    listeners.get(path)?.close();
    listeners.delete(path);
  },

  stopAll() {
    AudioService.stopMic();
    [...listeners.keys()].forEach(AudioService.stopListening);
  },
};

export default AudioService;
