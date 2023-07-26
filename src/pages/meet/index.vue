<script setup lang='ts'>
import Footer from './components/Footer.vue'
import Room from './components/Room.vue'
import Chat from './components/Chat.vue'
import Member from './components/Member.vue'
import { defaultConfig } from './config'

// 配置 ---------------------------------------------------------
const audio = ref(defaultConfig.audio)
const video = ref(defaultConfig.video)
const share = ref(defaultConfig.share)

function statusChange(payload: { type: 'audio' | 'video'; status: boolean }) {
  if (payload.type === 'audio')
    audio.value = payload.status // todo
  if (payload.type === 'video')
    video.value = payload.status // todo
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
  <div w-full h="100vh" p-4 pb-0 flex flex-col>
    <div flex-1 flex>
      <div overflow-hidden flex-1 bg-gray-200 rounded-2 transition-all-500>
        <Room />
      </div>
      <div w-0 :class="{ 'w-5': currentSide }" />
      <div
        overflow-hidden
        w-0 bg-orange rounded-2 transition-all-500
        :class="{ 'w-300px': currentSide }"
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
