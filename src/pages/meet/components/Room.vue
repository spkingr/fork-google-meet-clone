<script setup lang='ts'>
interface Config {
  audio: boolean
  video: boolean
}
const props = defineProps<Config>()

// 获取本地摄像头 ----------------------------------------------
const localVideo = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
const constraints = {
  video: true,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
}
async function getUserMedia() {
  localStream.value = await getMediaStream()
  localVideo.value!.srcObject = localStream.value
  initLocalByConfig() // 根据用户配置初始化本地流
}
function getMediaStream() {
  return navigator.mediaDevices.getUserMedia(constraints)
}

function initLocalByConfig() {
  const { audio, video } = props
  !audio && (localStream.value!.getAudioTracks()[0].enabled = false)
  !video && (localStream.value!.getVideoTracks()[0].enabled = false)
}

function toggleAudio() {
  const audioTrack = localStream.value!.getAudioTracks()[0]
  audioTrack.enabled = !audioTrack.enabled
}

function toggleVideo() {
  const videoTrack = localStream.value!.getVideoTracks()[0]
  videoTrack.enabled = !videoTrack.enabled
}

const isSharing = ref(false)
function toggleShare(toggle: boolean) {
  isSharing.value = toggle
  // 获取屏幕共享
  if (toggle) {
    return navigator.mediaDevices.getDisplayMedia(constraints)
      .then((stream) => {
        localVideo.value!.srcObject = stream
        localStream.value!.getTracks().forEach(track => track.stop())
        localStream.value = stream
      })
  }
  // 释放屏幕共享
  localStream.value!.getTracks().forEach(track => track.stop())
  getUserMedia()
}
// -----------------------------------------------------------

onMounted(() => {
  getUserMedia()
})

defineExpose({
  localVideo,
  toggleAudio,
  toggleVideo,
  toggleShare,
})
</script>

<template>
  <div w-full h-full flex-center bg-gray-200>
    <video
      ref="localVideo" autoplay muted playsinline
      :class="{ mirror: !isSharing }"
    />
  </div>
</template>
