<script setup lang='ts'>
import { onMounted } from 'vue'
import Footer from './components/Footer.vue'
import PreviewLayout from '~/layouts/preview.vue'

const router = useRouter()

// input name & join
const name = ref('')

// video ------------------------------------------
const localVideo = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
async function getUserMedia() {
  localStream.value = await getMediaStream()
  localVideo.value.srcObject = localStream.value
}
// 获取本地摄像头
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

// toggle-------------------------------------------------
const showVoice = ref(true)
const showVideo = ref(true)
function tracksChange(payload: { type: 'audio' | 'video'; status: boolean }) {
  if (payload.type === 'audio') {
    showVoice.value = payload.status
    localStream.value.getAudioTracks()[0].enabled = payload.status
    return
  }
  showVideo.value = payload.status
  localStream.value.getVideoTracks()[0].enabled = payload.status
}
// -------------------------------------------------------

// join --------------------------------------------------
function join() {
  router.push('/meet')
}
// ------------------------------------------------------
onMounted(() => {
  getUserMedia()
})
</script>

<template>
  <PreviewLayout>
    <div w-full h-full p="x-160px y-130px" flex>
      <!--  video  -->
      <div flex-1 b="1px solid gray-300" p-4 pb-14 rounded-2 relative>
        <div
          absolute left="50%" top--8 translate-x="-50%" w="150px" py-1 text-center
          rounded-2 transition-300 hover:bg-orange-4 cursor-pointer
        >
          This is your Tv 👏
        </div>
        <video
          ref="localVideo" w-full h-auto
          autoplay playsinline muted
          class="mirror"
        />
        <div absolute left-0 right-0 bottom-5 h-12>
          <Footer :video="showVideo" :audio="showVoice" @change="tracksChange" />
        </div>
      </div>
      <!-- span  -->
      <div w-10 />
      <!--  info  -->
      <div w="360px" px-6 py-20>
        <h2 text-xl font-600 mb-8>
          What's Your Name
        </h2>
        <div mb-8 class="underline-transition">
          <input
            v-model="name" type="text" h="50px" w-full
            px-4 border-none outline-none
            focus:outline-none
            bg-gray-100
            b-b="1px solid #ddd"
            placeholder="Your Name"
          >
        </div>
        <div w-full flex mb-10>
          <div
            h-10 flex-1 flex-center cursor-pointer
            bg-gray-200 color-gray-400 rounded-5
            shadow-md transition-400
            :class="{ 'hover:bg-blue-500 hover:shadow-blue color-white': name }"
            @click="join"
          >
            Ask To Join
          </div>
          <div w-8 />
          <div
            h-10 flex-1 flex-center cursor-pointer
            bg-gray-200 rounded-5
            shadow-md transition-400
            hover:bg-orange-500 hover:shadow-orange color-white
          >
            <div i-ic:sharp-arrow-back mr-4 />
            Home
          </div>
        </div>
        <div mx-2>
          After applying to join, you may need to wait for the room host to agree.
        </div>
      </div>
    </div>
  </PreviewLayout>
</template>
