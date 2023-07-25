<script setup lang='ts'>
import { useDrag } from '~/composables/useDrag'
import { dialogEmits, dialogProps } from '~/types/comp.dialog.d'

const props = defineProps(dialogProps)

const emits = defineEmits(dialogEmits)

const dialog = ref<HTMLElement | null>(null)
props.drag && useDrag(dialog)
</script>

<template>
  <Teleport v-if="props.visible" to="body" relative>
    <div
      class="mask"
      fixed bottom-0 left-0 right-0 top-0 z-9999 bg="[rgba(0,0,0,0.2)]"
      @click="() => emits('update:visible', false)"
    />
    <div
      ref="dialog"
      class="fade-in-out"
      bg="light"
      left="50%" top="50%" translate-x="-50%" translate-y="-50%"
      absolute z-10000 flex flex-col
      rounded-1 p-1 shadow-md
      :style="{ width: `${props.width}px`, height: `${props.height}px` }"
    >
      <header h="60px" flex items-center px-4>
        <slot name="header">
          {{ props.title }}
        </slot>
        <div
          i-ion:close-circle-outline absolute right-2 cursor-pointer
          bg-gray-300 text-2xl transition-300 hover:bg-gray-500
          @click="() => emits('update:visible', false)"
        />
      </header>
      <!-- default  -->
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.fade-in-out {
  animation: fade-in-out 0.6s;
}

@keyframes fade-in-out {
  0%   { opacity: 0; }
  50%  { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
