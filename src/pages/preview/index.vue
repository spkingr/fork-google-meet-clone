<script setup lang='ts'>
import { onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import Footer from './components/Footer.vue'
import PreviewLayout from '~/layouts/preview.vue'
import { useUserStore } from '~/store/useUser'
import { createRoomApi } from '~/api/live'

const userStore = useUserStore()

const router = useRouter()

// 拿到主持人标识
const isHost = userStore.user.isHost

// input name & join
const name = ref('')

// video ------------------------------------------
const localVideo = ref<HTMLVideoElement>()
const localStream = ref<MediaStream>()
async function getUserMedia() {
  localStream.value = await getMediaStream()
  localVideo.value!.srcObject = localStream.value
  initLocalByConfig() // 根据用户配置初始化本地流
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
function initLocalByConfig() {
  const { audio, video } = userStore.userConfig
  !audio && (localStream.value!.getAudioTracks()[0].enabled = false)
  !video && (localStream.value!.getVideoTracks()[0].enabled = false)
}

// toggle-------------------------------------------------
function tracksChange(payload: { type: 'audio' | 'video'; status: boolean }) {
  // 修改用户配置
  userStore.modifyUserConfig({ [payload.type]: payload.status })
  // 修改流
  if (payload.type === 'audio')
    localStream.value!.getAudioTracks()[0].enabled = payload.status
  if (payload.type === 'video')
    localStream.value!.getVideoTracks()[0].enabled = payload.status
}
// -----------------------------------------------------------------

// (join | create) --------------------------------------------------
function askToJoin() {
  if (!name.value) // 未输入名字
    return useMessage.error({ content: '请输入名字' })

  const hasRoom = userStore.isInRoom()
  if (hasRoom) // 已经在房间中
    return join()
  if (isHost && !hasRoom) // 无房间号 & 主持人 -> 创建房间
    return create()
}

async function join() {
  userStore.modifyUser({
    name: name.value,
  })
  router.push('/meet')
}

async function create() {
  userStore.modifyUser({
    __id__: uuidv4().substring(0, 6),
    name: name.value,
    isHost,
  })
  const { data } = await createRoom() // 创建房间
  userStore.modifyUser({ roomID: data.room_id }) // 设置房间号
  router.push('/meet')
}

async function createRoom() {
  const res = await createRoomApi({
    host_name: userStore.user.name,
    host_id: userStore.user.__id__,
  })
  return res
}
// ------------------------------------------------------

// back ------------------------------------------------------
const tipVisible = ref(false)
function back() {
  if (userStore.isInRoom())
    return tipVisible.value = true
  router.back()
}
function sure() {
  tipVisible.value = false
  userStore.clearUser()
  router.back()
}
// ---------------------------------------------------------

function free() {
  // 释放流 & 关闭摄像头
  localStream.value?.getTracks().forEach(track => track.stop())
}

function showUserinfo() {
  if (userStore.isInRoom())
    name.value = userStore.user.name
}

onMounted(() => {
  getUserMedia()
  showUserinfo()
})

onUnmounted(() => {
  free()
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
          <Footer
            :video="userStore.userConfig.video"
            :audio="userStore.userConfig.audio"
            @change="tracksChange"
          />
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
            v-model="name"
            :max-length="20"
            type="text" h="50px" w-full
            px-4 border-none outline-none
            focus:outline-none
            bg-gray-100 text-dark
            b-b="1px solid #ddd"
            placeholder="Your Name"
          >
        </div>
        <div w-full flex mb-10>
          <div
            h-10 flex-1 flex-center cursor-pointer
            bg-gray-200 color-gray-600 rounded-5
            shadow-md transition-400
            :class="{ 'hover:bg-blue-500 hover:shadow-blue color-white': name }"
            @click="askToJoin"
          >
            Ask To Join
          </div>
          <div w-8 />
          <div
            h-10 flex-1 flex-center cursor-pointer
            bg-gray-200 rounded-5
            shadow-md transition-400
            hover:bg-orange-500 hover:shadow-orange color-white
            @click="back"
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
    <!-- dialog -->
    <Dialog
      :visible="tipVisible"
      title="Leave the room"
      :width="360" :height="240" :drag="true"
      @update:visible="tipVisible = false"
    >
      <div h-full p="x-2 y-4" color-dark text-sm flex flex-col>
        <h3 flex-1 flex-center bg-gray-200>
          确定返回吗？返回时将同时退出会议
        </h3>
        <div h-2 />
        <div h="40px" flex font-bold cursor-pointer>
          <div
            bg-blue-3 flex-1 flex-center hover:bg-blue-4 transition-300
            @click="sure"
          >
            确定
          </div>
          <div
            bg-orange-3 flex-1 flex-center hover:bg-orange-4 transition-300
            @click="tipVisible = false"
          >
            取消
          </div>
        </div>
      </div>
    </Dialog>
  </PreviewLayout>
</template>
