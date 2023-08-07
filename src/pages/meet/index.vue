<script setup lang='ts'>
import Footer from './components/Footer.vue'
import Room from './components/Room.vue'
import Chat from './components/Chat.vue'
import Member from './components/Member.vue'
import { server } from './config'
import { CLIENT } from './socket'
import Adsorb from '~/components/Adsorb.vue'
import { useUserStore } from '~/store/useUser'

const roomRef = ref<InstanceType<typeof Room>>()
const router = useRouter()
const userStore = useUserStore()

const localPeer = ref<RTCPeerConnection | null>(null)

function initClientListener() {
  CLIENT.on('Joined', handleJoin)
  CLIENT.on('MemberJoined', handleMemberJoined)
  CLIENT.on('MessageFromPeer', hanldeMessageFromPeer)
  CLIENT.join({ ...userStore.user, memberId: CLIENT.id })
}

function handleJoin(data: any) {
  console.warn('you have joined the room')
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

  const remoteStream = new MediaStream() // 用于接收远端视频流
  roomRef.value!.remoteVideo!.srcObject = remoteStream

  roomRef.value!.localStream!.getTracks().forEach((track) => { // 将本地视频流添加到RTCPeerConnection中
    localPeer.value!.addTrack(track, roomRef.value!.localStream!)
  })

  localPeer.value!.ontrack = (event) => { // 监听远端视频流的到来
    event.streams[0].getTracks().forEach((track) => { // 将远端视频流添加到remoteStream中
      remoteStream.addTrack(track)
    })
  }
}

function peerListeners(memberId: string) {
  localPeer.value!.onicecandidate = (event) => { // 监听本地候选者信息
    if (event.candidate) {
      CLIENT.emit(
        'MessageToPeer',
        { type: 'candidate', candidate: event.candidate, memberId }, // 将本地候选者信息发送给对端
      )
    }
  }
}

// offer和answer只有一个会被调用
async function createOffer(memberId: string) {
  peerListeners(memberId)
  console.log(`2. local create offer to ${memberId}`)
  const offer = await localPeer.value!.createOffer() // 生成本地描述信息
  await localPeer.value!.setLocalDescription(offer) // 将本地描述信息设置到本地中
  CLIENT.emit('MessageToPeer', { type: 'offer', offer, memberId }) // 将本地描述信息发送给对端
}

async function createAnswer(memberId: string, offer: RTCSessionDescriptionInit) {
  peerListeners(memberId)
  console.log('local create answer ')
  await localPeer.value!.setRemoteDescription(offer) // 将对端的描述信息设置到本地
  const answer = await localPeer.value!.createAnswer() // 生成本地描述信息
  await localPeer.value!.setLocalDescription(answer) // 将本地描述信息设置到本地
  CLIENT.emit('MessageToPeer', { type: 'answer', answer, memberId }) // 将本地描述信息发送给对端
}

async function addAnswer(answer: RTCSessionDescriptionInit) {
  await localPeer.value!.setRemoteDescription(answer)
}

async function addIceCandidate(candidate: RTCIceCandidate) {
  console.log('add ice candidate')
  await localPeer.value!.addIceCandidate(candidate)
}
// 按钮操作 ---------------------------------------------------------
const share = ref(false) // 默认不共享
type ButtonType = 'audio' | 'video' | 'share'
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

function hangup() {
  // todo------------------------------------------------------
  // roomRef todo
  // rommRef 根据挂断用户来判断是否需要关闭房间 主持人挂断则关闭房间 其他人挂断则只关闭自己的流
  // ----------------------------------------------------------
  userStore.clearUser()
  router.push('/')
}

async function localStreamReady() {
  initClientListener() // socket实例初始化监听
  await createPeerConnection() // 创建RTCPeerConnection实例
}

onUnmounted(() => {
  // todo:  close socket connection
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
          ref="roomRef"
          :video="userStore.userConfig.video"
          :audio="userStore.userConfig.audio"
          @ready="localStreamReady"
        />
      </div>
      <div w-0 :class="{ 'w-5': currentSide }" />
      <div
        overflow-hidden
        w-0 bg-orange rounded-2 transition-all-500
        :class="{ 'w-360px': currentSide }"
      >
        <Chat v-if="currentSide === 'chat'" />
        <Member v-if="currentSide === 'member'" />
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
