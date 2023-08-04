<script setup lang='ts'>
import { constraints } from '../config'
import { useUserStore } from '~/store/useUser'

const emits = defineEmits(['ready'])

// 获取本地摄像头 ----------------------------------------------
const userStore = useUserStore()
const localVideo = ref<HTMLVideoElement | null>(null)
const localStream = ref<MediaStream | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

function initLocalByConfig() {
  const { audio, video } = userStore.userConfig
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

async function getUserMedia() {
  // fixme: 这里有可能会得到一个空的流
  localStream.value = await getMediaStream()
  localVideo.value!.srcObject = localStream.value
}

// 获取用户媒体流
function getMediaStream() {
  return navigator.mediaDevices.getUserMedia(constraints)
}

// 获取用户屏幕的视频流
async function getDisplayMedia() {
  return navigator.mediaDevices.getDisplayMedia(constraints)
}

const isSharing = ref(false)
async function toggleShare(toggle: boolean) {
  // 获取屏幕共享
  if (toggle) {
    let stream: MediaStream
    try {
      stream = await getDisplayMedia()
    }
    catch (err) { // 用户拒绝
      return [err]
    }
    localVideo.value!.srcObject = stream
    localStream.value!.getTracks().forEach(track => track.stop())
    localStream.value = stream
    isSharing.value = toggle

    return [null]
  }
  // 释放屏幕共享
  localStream.value!.getTracks().forEach(track => track.stop())
  getUserMedia()
  isSharing.value = toggle
  return [null]
}

// -----------------------------------------------------------

defineExpose({
  localStream,
  remoteVideo,
  localVideo,
  initLocalByConfig,
  toggleAudio,
  toggleVideo,
  toggleShare,
})

onMounted(async () => {
  await getUserMedia()
  initLocalByConfig()
  emits('ready')
})
</script>

<template>
  <div w-full h-full p-2 bg-gray-200 relative>
    <div class="local" h-full w-full>
      <video
        ref="localVideo"
        w-full h-full
        autoplay muted playsinline
        :class="{ mirror: !isSharing }"
      />
    </div>
    <Moveable :x="300" :y="200" :height="420" :width="600">
      <video ref="remoteVideo" w-full h-full autoplay muted playsinline />
    </Moveable>
  </div>
</template>
