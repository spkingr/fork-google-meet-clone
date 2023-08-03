<script setup lang='ts'>
import { usePeerStore } from '~/store/usePeer'

interface Props {
  audio: boolean
  video: boolean
}
const props = defineProps<Props>()

// 获取本地摄像头 ----------------------------------------------
const peerStore = usePeerStore()
const localVideo = ref<HTMLVideoElement>()
const remoteVideo = ref<HTMLVideoElement>()

function initLocalByConfig() {
  const { audio, video } = props
  !audio && (peerStore.localStream!.getAudioTracks()[0].enabled = false)
  !video && (peerStore.localStream!.getVideoTracks()[0].enabled = false)
}

function toggleAudio() {
  const audioTrack = peerStore.localStream!.getAudioTracks()[0]
  audioTrack.enabled = !audioTrack.enabled
}

function toggleVideo() {
  const videoTrack = peerStore.localStream!.getVideoTracks()[0]
  videoTrack.enabled = !videoTrack.enabled
}

const isSharing = ref(false)
async function toggleShare(toggle: boolean) {
  // 获取屏幕共享
  if (toggle) {
    let stream: MediaStream
    try {
      stream = await peerStore.getDisplayMedia()
    }
    catch (err) { // 用户拒绝
      return [err]
    }
    localVideo.value!.srcObject = stream
    peerStore.localStream!.getTracks().forEach(track => track.stop())
    peerStore.localStream! = stream
    isSharing.value = toggle

    return [null]
  }
  // 释放屏幕共享
  peerStore.localStream!.getTracks().forEach(track => track.stop())
  peerStore.getUserMedia(localVideo.value!, initLocalByConfig)
  isSharing.value = toggle
  return [null]
}
// -----------------------------------------------------------

onMounted(() => {
  peerStore.run(localVideo.value!, remoteVideo.value!, initLocalByConfig)
})

defineExpose({
  localVideo,
  toggleAudio,
  toggleVideo,
  toggleShare,
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
