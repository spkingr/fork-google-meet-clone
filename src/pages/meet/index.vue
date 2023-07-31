<script setup lang='ts'>
import Footer from './components/Footer.vue'
import Room from './components/Room.vue'
import Chat from './components/Chat.vue'
import Member from './components/Member.vue'
import { useUserStore } from '~/store/useUser'

import './socket'

const userStore = useUserStore()
const { userConfig } = userStore

// 配置 ---------------------------------------------------------
const audio = ref(userConfig.audio)
const video = ref(userConfig.video)
const share = ref(false)
const roomRef = ref<any>() // some Expose methods of Room component

type ButtonType = 'audio' | 'video' | 'share'
function statusChange(payload: { type: ButtonType; status: boolean }) {
  if (payload.type === 'audio') {
    audio.value = payload.status
    roomRef.value.toggleAudio()
  }
  if (payload.type === 'video') {
    video.value = payload.status
    roomRef.value.toggleVideo()
  }
  if (payload.type === 'share') {
    share.value = payload.status
    roomRef.value.toggleShare(share.value)
  }
  userStore.modifyUserConfig({ [payload.type]: payload.status })
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
</script>

<template>
  <div w-full h="100vh" p="15px" pb-0>
    <div h="[calc(100vh-75px)]" flex>
      <div overflow-hidden flex-1 bg-gray-100 rounded-2 transition-all-500>
        <Room
          ref="roomRef"
          :video="userConfig.video" :audio="userConfig.audio"
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
        :audio="audio" :video="video" :share="share"
        @change="statusChange"
        @show-side="showSide"
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
