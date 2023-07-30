<script setup lang='ts'>
import { useUserStore } from '~/store/useUser'

const userStore = useUserStore()
// 获取本地摄像头 ----------------------------------------------
const localVideo = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
async function getUserMedia() {
  localStream.value = await getMediaStream()
  localVideo.value!.srcObject = localStream.value
  initLocalByConfig() // 根据用户配置初始化本地流
}
function getMediaStream() {
  const constraints = {
    video: { aspectRatio: 16 / 9 },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  }
  return navigator.mediaDevices.getUserMedia(constraints)
}
function initLocalByConfig() {
  const { audio, video } = userStore.userConfig
  !audio && (localStream.value!.getAudioTracks()[0].enabled = false)
  !video && (localStream.value!.getVideoTracks()[0].enabled = false)
}
// -----------------------------------------------------------

onMounted(() => {
  getUserMedia()
})
</script>

<template>
  <div w-full h-full flex-center bg-gray-200>
    <video ref="localVideo" autoplay muted playsinline w-full h-auto class="mirror" />
  </div>
</template>
