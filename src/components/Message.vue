<script setup lang='ts'>
import { messageProps } from '~/types/comp.message.d'

const props = defineProps(messageProps)

const showMessage = ref(true)
function onClose() {
  showMessage.value = false
}
</script>

<template>
  <!-- 内容 -->
  <div
    v-if="showMessage"
    class="slide-in bg-white"
    m="x-5 y-6"
    min-w="240px"
    shadow="md"
    top="20px" left="50%"
    absolute z-9999
    flex items-center justify-between
    rounded-1 p-2
    transition duration-400
  >
    <!-- 消息类型图标，通过消息类型确定，text类型不配置图标 -->
    <div
      class="i-ic:outline-info  text-xl"
      :class="{
        'text-green-6': props.type === 'success',
        'text-red-6': props.type === 'error',
        'text-yellow-6': props.type === 'warning',
        'text-blue-6': props.type === 'info',
      }"
    />

    <!-- 消息文本 -->
    <span text-dark v-text="props.content" />

    <!-- 手动关闭消息 -->
    <div
      v-if="props.close"
      hover="bg-red-4 "
      cursor-pointer rounded-full text-gray-6 transition duration-400
    >
      <div i-ic:outline-close @click="onClose" />
    </div>
  </div>
</template>

<style scoped>
.slide-in {
  animation: slideIn 0.4s forwards;
}
@keyframes slideIn {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
