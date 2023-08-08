export const constraints = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
}

export const server: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
}
