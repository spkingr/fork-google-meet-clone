<script setup lang='ts'>
import dayjs from 'dayjs'
import { MessageTypeEnum } from '../types'
import type { Message, User } from '../types'

const props = defineProps<{
  msgList: Message[]
  user: User
}>()

const emits = defineEmits<{
  (e: 'sendMessage', msg: Message): void
}>()

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
</script>

<template>
  <div w-full h-full>
    <div w-full h="[calc(100%-100px)]" px-2 py-2 box-border>
      <div
        v-for="(msg, index) of props.msgList" :key="index"
        py-2 px-4 rounded-2 bg-light mb-1
      >
        <div flex items-center color-teal-800 font-800>
          <div mr-2>
            {{ msg.name }}
          </div>
          <div i-openmoji:waving-hand />
        </div>
        <div text="sm dark left">
          {{ msg.content }}
        </div>
      </div>
    </div>
    <div w-full h="100px" px-2 py-4 bg-light relative>
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
</template>
