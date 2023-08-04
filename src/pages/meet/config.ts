export const constraints = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
}

export const server: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.1.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
}
