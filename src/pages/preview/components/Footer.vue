<script setup lang='ts'>
import 'lu2/theme/edge/css/common/ui/Tips.css'

interface Props {
  audio: boolean
  video: boolean
}
const props = defineProps<Props>()
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
function change(type: 'audio' | 'video') {
  emits('change', { type, status: !props[type] })
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
        <div v-if="audio" text-2xl i-icon-park-outline:voice />
        <div v-else text-2xl bg-red-5 i-icon-park-outline:voice-off />
      </div>
      <div
        class="ui-tips" b="1px solid gray-200" rounded-full
        :class="[baseIconWithHover]" title="Video" @click="change('video')"
      >
        <div v-if="video" text-2xl i-material-symbols:videocam />
        <div v-else text-2xl bg-red-5 i-material-symbols:videocam-off-rounded />
      </div>
    </div>
  </div>
</template>
