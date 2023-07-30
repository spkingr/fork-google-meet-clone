<script setup lang='ts'>
import 'lu2/theme/edge/css/common/ui/Tips.css'
import dayjs from 'dayjs'

interface Props {
  audio: boolean
  video: boolean
  share: boolean
}
const props = withDefaults(
  defineProps<Props>(),
  { audio: true, video: true, share: false },
)
const emits = defineEmits<{
  (e: 'change', payload: { type: 'audio' | 'video'; status: boolean }): void
  (e: 'showSide', type: 'member' | 'chat'): void
}>()

// time ---------------------------------------------------
const getTime = () => dayjs().format('HH:mm:ss')
const time = ref('')
const timer = setInterval(() => (time.value = getTime()), 1000)
// -------------------------------------------------------

// common style ------------------------------------------------
const baseIconWithHover = `
flex-center w-10 h-10 mx-3
rounded-full transition-300
hover:bg-gray-200 hover:text-dark
cursor-pointer 
`
// -------------------------------------------------------------

// 处理toggle --------------------------------------------------
const [showVoice, toggleVoice] = useToggle(props.audio)
const [showVideo, toggleVideo] = useToggle(props.video)
// 这里乐观ui了，不等待结果直接改变状态
function change(type: 'audio' | 'video') {
  if (type === 'audio') {
    emits('change', { type: 'audio', status: !showVoice.value })
    toggleVoice()
  }
  if (type === 'video') {
    emits('change', { type: 'video', status: !showVideo.value })
    toggleVideo()
  }
}
// ------------------------------------------------------------

// 处理侧边栏 -------------------------------------------------
function showSide(type: 'member' | 'chat') {
  emits('showSide', type)
}
// ----------------------------------------------------------

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div h-full flex items-center>
    <!-- meeting info  -->
    <div h-full w="180px" text-sm flex items-center justify-between>
      <div font-bold p="x-3 y-1" hover:bg-gray-200 transition-300 rounded-1 cursor-pointer>
        MEET_CODE
      </div>
      <div font-bold cursor-pointer class="ui-tips" :title="dayjs().format('YYYY-MM-DD HH:mm')">
        {{ time }}
      </div>
    </div>

    <!-- meeting-control  -->
    <div flex-center flex-1>
      <div class="ui-tips" :class="[baseIconWithHover]" title="Audio" @click="change('audio')">
        <div v-if="showVoice" text-2xl i-icon-park-outline:voice />
        <div v-else text-2xl bg-red-5 i-icon-park-outline:voice-off />
      </div>
      <div class="ui-tips" :class="[baseIconWithHover]" title="Video" @click="change('video')">
        <div v-if="showVideo" text-2xl i-material-symbols:videocam />
        <div v-else text-2xl bg-red-5 i-material-symbols:videocam-off-rounded />
      </div>
      <div class="ui-tips" :class="[baseIconWithHover, { 'bg-blue': share }]" title="Share">
        <div text-2xl i-material-symbols:screenshot-monitor-outline />
      </div>
      <div
        class="ui-tips" title="Hangup"
        :class="[baseIconWithHover]" w-15 bg-red-500 hover:bg-red-5
      >
        <div text-2xl i-majesticons:phone-hangup color-white />
      </div>
    </div>

    <!-- meeting extra  -->
    <div h="80%" w-160px flex-center bg-gray-100 text-gray-500 rounded-4>
      <div :class="[baseIconWithHover]" class="ui-tips" title="member" @click="showSide('member')">
        <div text-xl i-ion:people-outline />
      </div>
      <div :class="[baseIconWithHover]" class="ui-tips" title="chat" @click="showSide('chat')">
        <div text-xl i-ic:outline-mark-chat-unread />
      </div>
    </div>
  </div>
</template>
