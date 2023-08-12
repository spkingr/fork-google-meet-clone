<script setup lang='ts'>
import adapter from 'webrtc-adapter'
import HomeLayout from '~/layouts/home.vue'
import meetSvg from '~/assets/meet.svg'
import { useLoading, useMessage } from '~/composables'
import { useUserStore } from '~/store/useUser'
import { queryRoomApi } from '~/api/live'

// eslint-disable-next-line no-console
console.log(adapter.browserDetails.browser)

const router = useRouter()
const userStore = useUserStore()

const createOptions = [
  { icon: 'i-ic:twotone-insert-link', text: '创建稍后使用的会议', handler: showLink },
  { icon: 'i-ic:sharp-plus', text: '创建即时会议', handler: createMeet },
]

async function loading(time = 1000) {
  const { open: openLoading, close: closeLoading } = useLoading()
  openLoading()
  await new Promise((resolve) => {
    setTimeout(() => {
      closeLoading()
      resolve(true)
    }, time)
  })
}

// TODO: invite link-----------------------------------------------------------
// vueuse useClipboard useToggle onClickOutside => see: https://vueuse.org/
const loadingRef = ref<HTMLElement>()
const [show, toggle] = useToggle(false)
const linkVisible = ref(false)
const link = ref('TODO: invite link')
const { copy } = useClipboard()
async function showLink() {
  linkVisible.value = true
}
function copyLink(link: string) {
  copy(link)
  useMessage.success({ content: '复制成功' })
}
// -------------------------------------------------------------------

// create meet--------------------------------------------------------
async function createMeet() {
  await loading(2000)
  // 设置一个主持人标识
  userStore.modifyUser({ isHost: true })
  // 跳转到预览页面
  router.push('/preview')
}
// -------------------------------------------------------------------

// join meet----------------------------------------------------------
const code = ref('')
async function join() {
  const { data } = await queryRoomApi({ room_id: code.value })
  if (!data)
    return useMessage.error({ content: '会议不存在' })
  if (data.member_count >= data.room_capacity)
    return useMessage.error({ content: '房间已满' })

  userStore.modifyUser({ roomID: code.value, isHost: false })
  loading()
  router.push('/preview')
}
// -------------------------------------------------------------------

// options------------------------------------------------------------
const optionsRef = ref<HTMLElement | null>(null)
onClickOutside(optionsRef, () => toggle(false))

// -------------------------------------------------------------------
function jump() {
  if (userStore.isInRoom())
    router.push('/preview')
}

onMounted(() => {
  jump() // 根据是否已经有房间信息来实行跳转
})
</script>

<template>
  <HomeLayout>
    <div h-full w-full flex>
      <!-- create -->
      <div flex-1>
        <div class="join-create" h-full flex items-center justify-center>
          <div class="create" relative>
            <button
              class="ui-button"
              h="46px" bg="[rgb(26,115,232)]" b="none"
              flex items-center
              @click="() => toggle()"
            >
              <div i-simple-icons:googlemeet mr-3 />
              <span>CREATE NEW</span>
            </button>
            <div
              v-if="show" ref="optionsRef"
              w="260px" border="1px solid gray-300" absolute mt-4 rounded-1 p="y-2 x-4"
            >
              <div
                v-for="(option, index) of createOptions" :key="index"
                flex p-4 transition-300
                hover="bg-gray-200 rounded-1 cursor-pointer"
                @click="option.handler"
              >
                <div :class="option.icon" mr-4 text-xl text-dark />
                <div text-gray-500>
                  {{ option.text }}
                </div>
              </div>
            </div>
          </div>

          <div w-10 />
          <TheInput
            id="the-input"
            v-model="code"
            placeholder="Meeting Code"
          />
          <div
            h="48px" p="x-3 y-2" ml-3
            box-border cursor-pointer rounded-2 text-xl font-800
            transition-300
            :class="{
              'color-[rgba(26,115,232,.8)]': code,
              'hover:bg-[rgba(26,115,232,.2)]': code,
              'hover:bg-gray-200': !code,
              'cursor-cell': !code,
            }"
            @click="join"
          >
            Join
          </div>
        </div>
      </div>

      <!-- login -->
      <div flex flex-1 items-center justify-center>
        <img :src="meetSvg" w="450px" h="450px" draggable="false">
      </div>
    </div>

    <!-- dialog -->
    <Dialog
      :visible="linkVisible"
      title="以下是会议链接: "
      :width="360" :height="240" :drag="true"
      @update:visible="linkVisible = false"
    >
      <div p-2 mt-2 text-gray-500>
        <div text-sm text-dark>
          复制此链接，然后发送给会议邀请对象。请务必妥善保存链接，以便日后使用。
        </div>
        <div ref="loadingRef" p="x-2 y-4" m="y-5" flex items-center justify-between rounded-1 bg-gray-200>
          <div> {{ link }} </div>
          <div
            i-material-symbols:content-copy-outline
            cursor-pointer text-xl
            text-gray-400 hover:text-gray-700
            is-tips="css" title="复制链接"
            @click="copyLink(link)"
          />
        </div>
      </div>
    </Dialog>
  </HomeLayout>
</template>

<style lang="scss" scoped>
:deep(#the-input) > #input:focus {
  outline: none;
  border-color: rgb(26,115,232);
  box-shadow: 0 0 0 3px rgba(26,115,232,.2);
}
</style>
