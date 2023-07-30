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

function toggleAudio() {
  const audioTrack = localStream.value!.getAudioTracks()[0]
  audioTrack.enabled = !audioTrack.enabled
  userStore.modifyUserConfig({ audio: audioTrack.enabled })
}

function toggleVideo() {
  const videoTrack = localStream.value!.getVideoTracks()[0]
  videoTrack.enabled = !videoTrack.enabled
  userStore.modifyUserConfig({ video: videoTrack.enabled })
}
// -----------------------------------------------------------

onMounted(() => {
  getUserMedia()
})

defineExpose({
  localVideo,
  toggleAudio,
  toggleVideo,
})
</script>

<template>
  <div w-full h-full flex-center bg-gray-200>
    <video ref="localVideo" autoplay playsinline h="100%" class="mirror" />
  </div>
</template>
