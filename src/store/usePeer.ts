import { defineStore } from 'pinia'

// stun服务器-------------------------------------------------------
export const server: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.1.google.com:19302'] },
  ],
}
// ----------------------------------------------------------------

export const usePeerStore = defineStore(
  'peer',
  () => {
    const isReady = ref(false) // 是否初始化完成

    const localPeer = ref<RTCPeerConnection | null>(null)
    const remotePeer = ref<RTCPeerConnection | null>(null)

    const localStream = ref<MediaStream | null>(null)
    const remoteStream = ref<MediaStream | null>(null)

    const localVideo = ref<HTMLVideoElement | null>(null)
    const remoteVideo = ref<HTMLVideoElement | null>(null)

    const constraints = {
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    }

    // 初始化
    async function run(localVideoDOM: HTMLVideoElement, remoteVideoDOM: HTMLVideoElement, callback: () => void) {
      // 获取到video标签
      localVideo.value = localVideoDOM
      remoteVideo.value = remoteVideoDOM
      // 获取本地用户摄像头
      await getUserMedia(localVideo.value, callback)
    }

    async function getUserMedia(localVideo: HTMLVideoElement, callback: () => void) {
      // fixme: 这里有可能会得到一个空的流
      localStream.value = await getMediaStream()
      localVideo.srcObject = localStream.value
      callback() // 根据用户配置初始化本地流
      isReady.value = true // 初始化完成
    }

    // 获取用户屏幕的视频流
    async function getDisplayMedia() {
      return navigator.mediaDevices.getDisplayMedia(constraints)
    }

    // 获取用户媒体流
    function getMediaStream() {
      return navigator.mediaDevices.getUserMedia(constraints)
    }

    // 创建本地 peer
    async function createPeerConnection() {
      // 创建本地 peer
      localPeer.value = new RTCPeerConnection(server)

      // 获取本地流
      localStream.value?.getTracks().forEach((track) => {
        localPeer.value?.addTrack(track, localStream.value!) // 将本地流添加到localPeer中
      })

      // 用于接收远端视频流
      remoteStream.value = new MediaStream()
      remoteVideo.value!.srcObject = remoteStream.value

      // 监听本地 peer 的 icecandidate 事件
      localPeer.value.onicecandidate = (e) => {
        if (e.candidate)
          remotePeer.value?.addIceCandidate(e.candidate)
      }

      // 监听本地 peer 的 track 事件 => 监听远端流的到来
      localPeer.value.ontrack = (event) => {
        // stream[0] 是视频流，stream[1] 是音频流
        // tracks 是流的轨道，可以理解为流的内容
        event.streams[0].getTracks().forEach((track) => { // 将远端视频流添加到remoteStream中
          remoteStream.value!.addTrack(track)
        })
      }
    }

    async function addAnswer(answer: RTCSessionDescriptionInit) {
      await localPeer.value!.setRemoteDescription(answer)
    }

    // offer和answer只有一个会被调用
    async function createOffer(sendMessage: (data: any) => void) {
      await createPeerConnection()
      // console.log('create offer')
      const offer = await localPeer.value!.createOffer() // 生成本地描述信息
      await localPeer.value!.setLocalDescription(offer) // 将本地描述信息设置到pc1中
      sendMessage({ type: 'offer', offer }) // 将本地描述信息发送给pc2
    }

    async function createAnswer(sendMessage: (data: any) => void, offer: RTCSessionDescriptionInit) {
      await createPeerConnection()
      await localPeer.value!.setRemoteDescription(offer) // 将pc2的描述信息设置到pc1中
      // console.log('create answer')
      const answer = await localPeer.value!.createAnswer() // 生成本地描述信息
      await localPeer.value!.setLocalDescription(answer) // 将本地描述信息设置到pc1中
      sendMessage({ type: 'answer', answer }) // 将本地描述信息发送给pc2
    }

    return {
      isReady,
      localPeer,
      remotePeer,
      localStream,
      remoteStream,
      run,
      getUserMedia,
      getDisplayMedia,
      createPeerConnection,
      createOffer,
      createAnswer,
      addAnswer,
    }
  },
  {
    persist: {
      storage: window.sessionStorage,
    },
  },
)
