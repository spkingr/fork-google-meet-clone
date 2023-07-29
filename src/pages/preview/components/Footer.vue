<script setup lang='ts'>
import 'lu2/theme/edge/css/common/ui/Tips.css'

interface Props {
  audio: boolean
  video: boolean
}
const props = withDefaults(
  defineProps<Props>(),
  { audio: true, video: true },
)
const emits = defineEmits<{
  (e: 'change', payload: { type: 'audio' | 'video'; status: boolean }): void
}>()

// common style ------------------------------------------------
const baseIconWithHover = `
flex-center w-10 h-10 mx-3
rounded-full transition-300
hover:bg-gray-200 cursor-pointer 
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
</script>

<template>
  <div h-full flex items-center>
    <!-- meeting-control  -->
    <div flex-center flex-1>
      <div
        class="ui-tips" b="1px solid gray-200" rounded-full
        :class="[baseIconWithHover]" title="Audio" @click="change('audio')"
      >
        <div v-if="showVoice" text-2xl i-icon-park-outline:voice />
        <div v-else text-2xl bg-red-5 i-icon-park-outline:voice-off />
      </div>
      <div
        class="ui-tips" b="1px solid gray-200" rounded-full
        :class="[baseIconWithHover]" title="Video" @click="change('video')"
      >
        <div v-if="showVideo" text-2xl i-material-symbols:videocam />
        <div v-else text-2xl bg-red-5 i-material-symbols:videocam-off-rounded />
      </div>
    </div>
  </div>
</template>
