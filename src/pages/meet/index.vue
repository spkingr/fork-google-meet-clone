<script setup lang='ts'>
import Footer from './components/Footer.vue'
import Room from './components/Room.vue'
import Chat from './components/Chat.vue'
import Member from './components/Member.vue'
import Adsorb from '~/components/Adsorb.vue'
import { useUserStore } from '~/store/useUser'

import './socket'

const router = useRouter()
const userStore = useUserStore()

// 按钮操作 ---------------------------------------------------------
const share = ref(false) // 默认不共享
const roomRef = ref<any>()
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
  roomRef.value.toggleAudio()
}
function toggleVideo() {
  if (share.value) // 共享状态下不允许操作摄像头
    return '[toggle error] not allow when sharing'
  roomRef.value.toggleVideo()
}
async function toggleShare(toggle: boolean) {
  share.value = toggle
  const [err] = await roomRef.value.toggleShare(toggle)
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

// 判断用户是否有房间号 ----------------------------------------------
const { open: openLoading, close: closeLoading } = useLoading()
const hasCheckedRoomID = ref(false)
function checkRoomID() {
  const roomID = userStore.user.roomID
  if (roomID)
    return hasCheckedRoomID.value = true
  openLoading()
  setTimeout(() => {
    closeLoading()
    router.push('/')
  }, 1000)
}

checkRoomID()
// ------------------------------------------------------------------
</script>

<template>
  <div w-full h="100vh" p="15px" pb-0>
    <Adsorb :x="100" :y="100">
      <template #content>
        <div w-full h-full bg-light text-center p-2 text-sm text-gray-500>
          看情况这里展示点啥
        </div>
      </template>
    </Adsorb>
    <div h="[calc(100vh-75px)]" flex>
      <div overflow-hidden flex-1 bg-gray-100 rounded-2 transition-all-500>
        <Room
          v-if="hasCheckedRoomID"
          ref="roomRef"
          :video="userStore.userConfig.video"
          :audio="userStore.userConfig.audio"
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
