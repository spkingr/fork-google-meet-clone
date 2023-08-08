<script setup lang='ts'>
import { constraints, server } from './config'
import { CLIENT } from './socket'
import { useUserStore } from '~/store/useUser'

const userStore = useUserStore()

const localPeer = ref<RTCPeerConnection | null>(null)
const localStream = ref<MediaStream | null>(null)
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

function initClientListener() {
  CLIENT.on('Joined', handleJoin)
  CLIENT.on('MemberJoined', handleMemberJoined)
  CLIENT.on('MessageFromPeer', hanldeMessageFromPeer)
  CLIENT.on('Heartbeat', hanleHeartbeat)

  CLIENT.join({ ...userStore.user, memberId: CLIENT.id })
}

function handleJoin(data: any) {
  console.warn('you have joined the room', CLIENT.id)
}

function hanleHeartbeat() {
  console.log('heartbeat')
  CLIENT.emit('Heartbeat', { memberId: CLIENT.id })
}

function handleMemberJoined(data: any) {
  const { memberId } = data
  console.log('1. member joined', memberId)
  createOffer(memberId) // 注意⚠️：这里的memberId是对端的id
}

/**
 * @description
 * 1. 来自对端的消息
 * 2. data的type有三种 'offer' | 'answer' | 'candidate
 * 3. memberId是对端的id 即这个消息是从哪个对端发来的
 */
async function hanldeMessageFromPeer(data: any) {
  const { type, memberId: fromId } = data
  console.log('3. message from peer', type)
  if (type === 'offer')
    await createAnswer(fromId, data.offer)
  if (type === 'answer')
    await addAnswer(data.answer)
  if (type === 'candidate')
    await addIceCandidate(data.candidate)
}

async function createPeerConnection() {
  localPeer.value = new RTCPeerConnection(server)

  localStream.value!.getTracks().forEach((track) => { // 将本地视频流添加到RTCPeerConnection中
    localPeer.value!.addTrack(track, localStream.value!)
  })
}

function peerListeners(memberId: string) {
  const remoteStream = new MediaStream() // 用于接收远端视频流
  remoteVideo.value!.srcObject = remoteStream

  localPeer.value!.ontrack = (event) => { // 监听远端视频流的到来
    event.streams[0].getTracks().forEach((track) => { // 将远端视频流添加到remoteStream中
      remoteStream.addTrack(track)
    })
  }

  localPeer.value!.onicecandidate = (event) => { // 监听本地候选者信息
    if (!event.candidate)
      return
    CLIENT.emit(
      'MessageToPeer',
      { type: 'candidate', candidate: event.candidate, memberId }, // 将本地候选者信息发送给对端
    )
  }
}

// offer和answer只有一个会被调用
async function createOffer(memberId: string) {
  peerListeners(memberId)
  const offer = await localPeer.value!.createOffer() // 生成本地描述信息
  await localPeer.value!.setLocalDescription(offer) // 将本地描述信息设置到本地中

  console.log(`2. local create offer to ${memberId}`, offer)

  CLIENT.emit('MessageToPeer', { type: 'offer', offer, memberId }) // 将本地描述信息发送给对端 带上对端id以便可以找到对端的socket实例
}

async function createAnswer(memberId: string, offer: RTCSessionDescriptionInit) {
  peerListeners(memberId)

  await localPeer.value!.setRemoteDescription(offer) // 将对端的描述信息设置到本地 设置完这个之后 peer的状态就会变成have-remote-offer
  const answer = await localPeer.value!.createAnswer() // 生成本地描述信息
  await localPeer.value!.setLocalDescription(answer) // 将本地描述信息设置到本地

  console.log(
    'answer =======> ',
    `local create answer， offer is  ${offer}`,
    `answer is ${answer}`,
  )

  CLIENT.emit('MessageToPeer', { type: 'answer', answer, memberId }) // 将本地描述信息发送给对端
}

async function addAnswer(answer: RTCSessionDescriptionInit) {
  await localPeer.value!.setRemoteDescription(answer)
}

async function addIceCandidate(candidate: RTCIceCandidate) {
  console.log('add ice candidate')
  await localPeer.value!.addIceCandidate(candidate)
}

// 获取本地摄像头 ----------------------------------------------
async function getUserMedia() {
  // fixme: 这里有可能会得到一个空的流
  localStream.value = await getMediaStream()
  localVideo.value!.srcObject = localStream.value
}

// 获取用户媒体流
function getMediaStream() {
  return navigator.mediaDevices.getUserMedia(constraints)
}

// 获取用户屏幕的视频流------------------------------------------------
async function leaveChannel() {
  CLIENT.emit('Leave', { memberId: CLIENT.id })
}
onMounted(async () => {
  await getUserMedia()
  initClientListener()
  await createPeerConnection()
  window.addEventListener('beforeunload', leaveChannel)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', leaveChannel)
  localPeer.value?.close()
  localStream.value?.getTracks().forEach((track) => {
    track.stop()
  })
})
</script>

<template>
  <div w-full h-full p-2 bg-gray-200 relative>
    <div class="local" h-full w-full>
      <video
        ref="localVideo"
        w-full h-full
        autoplay muted playsinline
        class="mirror"
      />
    </div>
    <Moveable :x="300" :y="200" :height="420" :width="600">
      <video ref="remoteVideo" w-full h-full autoplay muted playsinline class="mirror" />
    </Moveable>
  </div>
</template>
