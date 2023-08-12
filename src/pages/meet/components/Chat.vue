<script setup lang='ts'>
import 'lu2/theme/edge/css/common/ui/Tips.css'
import dayjs from 'dayjs'
import { MessageTypeEnum } from '../types'
import type { Message, User } from '../types'
import { useUserStore } from '~/store/useUser'

const props = defineProps<{
  msgList: Message[]
  user: User
}>()

const emits = defineEmits<{
  (e: 'sendMessage', msg: Message): void
}>()

const userStore = useUserStore()

const message = ref('')

function sendMessage() {
  if (!message.value.trim())
    return
  const msg = {
    content: message.value,
    time: dayjs(new Date()).format('HH:mm:ss'),
    name: props.user.name,
    type: MessageTypeEnum.TEXT,
  }
  emits('sendMessage', msg)
  message.value = ''
}

const emojiVisible = ref(false)
function showEmoji() {
  emojiVisible.value = !emojiVisible.value
}
function selectEmoji(emoji: string) {
  message.value += emoji
}
function greet() {
  message.value = `${userStore.user.name} => 👋 👋 👋`
}
function clearMessage() {
  message.value = ''
}
function showTime() {
  message.value = dayjs(new Date()).format('HH:mm:ss')
}
</script>

<template>
  <div w-full h-full>
    <div w-full h="[calc(100%-130px)]" px-2 py-2 box-border>
      <div
        v-for="(msg, index) of props.msgList" :key="index"
        py-2 px-4 rounded-2 bg-light mb-1
      >
        <div flex items-center color-teal-800 font-800>
          <div mr-2>
            {{ msg.name === user.name ? 'you' : msg.name }}
          </div>
          <div v-if="msg.name === user.name " mr-2 i-iconoir:people-tag />
          <div i-openmoji:waving-hand />
        </div>
        <div text="sm dark left">
          {{ msg.content }}
        </div>
      </div>
    </div>
    <div h="130px" relative bg-light box-border>
      <div h="30px" flex items-center>
        <div mx-2 text-xl class="ui-tips" title="emoji" @click="showEmoji">
          <div text-teal-6 i-solar:emoji-funny-circle-bold />
        </div>
        <div mx-2 class="ui-tips" title="greet" @click="greet">
          <div text-teal-6 i-solar:hand-shake-broken />
        </div>
        <div mx-2 class="ui-tips" title="clear" @click="clearMessage">
          <div text-teal-6 i-material-symbols:arrow-left-alt />
        </div>
        <div mx-2 class="ui-tips" title="time" @click="showTime">
          <div text-teal-6 i-mdi:clock-outline />
        </div>

        <Emoji v-if="emojiVisible" absolute bottom="130px" left="4px" @select="selectEmoji" />
      </div>
      <div w-full h="90px" p="x-2 y-0" relative>
        <textarea
          v-model="message"
          class="ui-textarea !pr-10"
          placeholder="......"
          maxlength="80" resize-none
          w-full h-full
        />
        <div
          i-bx:bxs-paper-plane
          absolute right-5 text-2xl top="50%" translate-y="-50%"
          transition-400 cursor-pointer
          hover="bg-teal-600"
          @click="sendMessage"
        />
      </div>
    </div>
  </div>
</template>
