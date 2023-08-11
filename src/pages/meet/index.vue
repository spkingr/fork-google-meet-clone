<script setup lang='ts'>
import Footer from './components/Footer.vue'
import Room from './components/Room.vue'
import Chat from './components/Chat.vue'
import Member from './components/Member.vue'
import { server } from './config'
import { CLIENT } from './socket'
import type { ButtonType, Message } from './types'
import { useUserStore } from '~/store/useUser'

const CHANNEL = ref<RTCDataChannel | null>(null)
const roomRef = ref<InstanceType<typeof Room>>()
const router = useRouter()
const userStore = useUserStore()

const localPeer = ref<RTCPeerConnection | null>(null)
const { user: { roomID, isHost } } = userStore

function initClientListener() {
  CLIENT.on('Joined', handleJoin)
  CLIENT.on('MemberJoined', handleMemberJoined)
  CLIENT.on('MessageFromPeer', hanldeMessageFromPeer)
  CLIENT.on('Heartbeat', hanleHeartbeat)
  CLIENT.on('RoomClosed', hanldeRoomClosed)
  CLIENT.join({ ...userStore.user, memberId: CLIENT.id, roomID })
}

function hanleHeartbeat() {
  CLIENT.emit('Heartbeat', { memberId: CLIENT.id, roomID })
}

function handleJoin(data: any) {
  console.warn('you have joined the room')
}

function handleMemberJoined(data: any) {
  const { memberId } = data
  createOffer(memberId)
}

function hanldeRoomClosed(data: any) {
  useMessage.warning({ content: '房间已关闭' })
  userStore.clearUser()
  gotoHome()
}
// rtc ---------------------------------------------------------------------------------
async function hanldeMessageFromPeer(data: any) {
  const { type, memberId: fromId } = data
  if (type === 'offer')
    await createAnswer(fromId, data.offer)
  if (type === 'answer')
    await addAnswer(data.answer)
  if (type === 'candidate')
    await addIceCandidate(data.candidate)
}

async function createPeerConnection() {
  localPeer.value = new RTCPeerConnection(server)

  // 这里处理本地和远端的视频流
  const remoteStream = new MediaStream()
  roomRef.value!.remoteVideo!.srcObject = remoteStream

  roomRef.value!.localStream!.getTracks().forEach((track) => {
    localPeer.value!.addTrack(track, roomRef.value!.localStream!)
  })
  localPeer.value!.ontrack = (event) => { // 监听远端视频流的到来
    event.streams[0].getTracks().forEach((track) => { // 将远端视频流添加到remoteStream中
      remoteStream.addTrack(track)
    })
  }
}

function peerListeners(memberId: string) {
  localPeer.value!.onicecandidate = (event) => {
    if (!event.candidate)
      return
    CLIENT.emit(
      'MessageToPeer',
      { type: 'candidate', candidate: event.candidate, memberId, roomID },
    )
  }
  localPeer.value!.oniceconnectionstatechange = () => {
    if (localPeer.value!.iceConnectionState === 'disconnected')
      return console.warn('ice connection state disconnected >>>>>>>>')
    console.warn('ice connection state', localPeer.value!.iceConnectionState)
  }
}

// offer和answer只有一个会被调用
async function createOffer(memberId: string) {
  peerListeners(memberId)
  openChannel() // 打开channel
  const offer = await localPeer.value!.createOffer()
  await localPeer.value!.setLocalDescription(offer)
  CLIENT.emit('MessageToPeer', { type: 'offer', offer, memberId, roomID })
}

async function createAnswer(memberId: string, offer: RTCSessionDescriptionInit) {
  peerListeners(memberId)
  openChannel() // 打开channel
  await localPeer.value!.setRemoteDescription(offer)
  const answer = await localPeer.value!.createAnswer()
  await localPeer.value!.setLocalDescription(answer)
  CLIENT.emit('MessageToPeer', { type: 'answer', answer, memberId, roomID })
}

async function addAnswer(answer: RTCSessionDescriptionInit) {
  await localPeer.value!.setRemoteDescription(answer)
}

async function addIceCandidate(candidate: RTCIceCandidate) {
  await localPeer.value!.addIceCandidate(candidate)
}
// ---------------------------------------------------------------------------------

// channel -------------------------------------------------------
const msgList = ref<Message[]>([])

function openChannel() {
  const channel = localPeer.value!.createDataChannel('channel')
  // console.log('-----open channel ing------')
  channel.onopen = () => {
    console.warn('----channel open----')
  }
  channel.onmessage = (event) => {
    if (!event.data)
      return console.warn('----channel message is empty----')
    // console.log('the msg is ', event.data)
    const msg: Message = JSON.parse(event.data)
    msgList.value.push(msg)
  }
  channel.onclose = () => {
    console.warn('----channel close----')
  }
  CHANNEL.value = channel
}

function sendChannelMessage(message: Message) {
  CHANNEL.value!.send(JSON.stringify(message))
  msgList.value.push(message)
}
// ---------------------------------------------------------------

// 按钮操作 ---------------------------------------------------------
const share = ref(false) // 默认不共享

const handlers = {
  audio: () => toggleAudio(),
  video: () => toggleVideo(),
  share: (toggle: boolean) => toggleShare(toggle),
}

async function statusChange(payload: { type: ButtonType; status: boolean }) {
  const err = await handlers[payload.type](payload.status)
  if (err)
    return console.warn(err)
  userStore.modifyUserConfig({ [payload.type]: payload.status })
}

function toggleAudio() {
  roomRef.value!.toggleAudio()
}

function toggleVideo() {
  if (share.value) // 共享状态下不允许操作摄像头
    return '[toggle error] not allow when sharing'
  roomRef.value!.toggleVideo()
}

async function toggleShare(toggle: boolean) {
  share.value = toggle
  const [err] = await roomRef.value!.toggleShare(toggle)
  if (err)
    share.value = false
  else
    share.value = toggle
}
// -----------------------------------------------------------

// 侧边栏 -----------------------------------------------------
const currentSide = ref<'member' | 'chat' | ''>('')
const show = ref(false)
function showSide(type: 'member' | 'chat') {
  if (!show.value) {
    show.value = true
    currentSide.value = type
    return
  }
  if (currentSide.value === type) {
    show.value = false
    currentSide.value = ''
    return
  }
  currentSide.value = type
}
// -----------------------------------------------------------

function gotoHome() {
  const { open, close } = useLoading()
  open()
  setTimeout(() => {
    close()
    router.push('/')
  }, 1000)
}

function hangup() {
  // rommRef 根据挂断用户来判断是否需要关闭房间 主持人挂断则关闭房间 其他人挂断则只关闭自己的流
  userStore.clearUser()
  if (!isHost)
    leaveChannel()
  else
    closeRoom()
  gotoHome()
}

// check room --------------------------------------------------
const isInRoom = userStore.isInRoom()
function checkRoom() {
  if (!isInRoom)
    gotoHome()
}
checkRoom()
// -----------------------------------------------------------

function closeRoom() {
  CLIENT.emit('CloseRoom', { memberId: CLIENT.id, roomID })
}

async function leaveChannel() {
  CLIENT.emit('Leave', { memberId: CLIENT.id, roomID })
}

async function localStreamReady() {
  initClientListener()
  await createPeerConnection()
  window.addEventListener('beforeunload', leaveChannel)
}

onUnmounted(() => {
  window.removeEventListener('beforeunload', leaveChannel)
  localPeer.value?.close()
})
</script>

<template>
  <div w-full h="100vh" p="15px" pb-0>
    <Adsorb :x="100" :y="100">
      <template #content>
        <div w-full h-full bg-light text-center p-2 text-sm text-gray-500>
          现在只做了p2p流程
        </div>
      </template>
    </Adsorb>
    <div h="[calc(100vh-75px)]" flex>
      <div overflow-hidden flex-1 bg-gray-100 rounded-2 transition-all-500>
        <Room
          v-if="isInRoom"
          ref="roomRef"
          :video="userStore.userConfig.video"
          :audio="userStore.userConfig.audio"
          @ready="localStreamReady"
        />
      </div>
      <div w-0 :class="{ 'w-5': currentSide }" />
      <div
        overflow-hidden
        w-0 bg-gray-200 rounded-2 transition-all-500
        :class="{ 'w-360px': currentSide }"
      >
        <Chat
          v-show="currentSide === 'chat'"
          :user="userStore.user"
          :msg-list="msgList"
          @send-message="sendChannelMessage"
        />
        <Member v-show="currentSide === 'member'" />
      </div>
    </div>
    <div h="60px">
      <Footer
        :video="userStore.userConfig.video"
        :audio="userStore.userConfig.audio"
        :share="share"
        @change="statusChange"
        @show-side="showSide"
        @hangup="hangup"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.slide-in {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  0% {
    transform: translateX(300px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
