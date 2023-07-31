<script setup lang="ts" name="NoAdsorb">
import { computed, nextTick, onMounted, ref } from 'vue'
import { adsorbProps } from '~/types/comp.adsorb.d'

const props = defineProps(adsorbProps)

const init = ref({
  x: props.x,
  y: props.y,
})

const show = ref(false)
const dragRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// 拖动--------------------------------------------------------------
const moveLock = ref(false)
const dragStart = { x: props.x, y: props.y }
const delta = { x: 0, y: 0 }
function mousedownHandler(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  moveLock.value = true
  const { clientX, clientY } = e
  dragStart.x = clientX
  dragStart.y = clientY
  document.addEventListener('mousemove', mousemoveHandler)
  document.addEventListener('mouseup', mouseupHandler)
}
function mousemoveHandler(e: MouseEvent) {
  if (!moveLock.value)
    return
  const { clientX, clientY } = e
  delta.x = clientX - dragStart.x
  delta.y = clientY - dragStart.y
  dragStart.x = clientX
  dragStart.y = clientY

  init.value.x += delta.x
  init.value.y += delta.y

  dragRef.value!.style.transition = 'none'
}
function mouseupHandler(e: MouseEvent) {
  moveLock.value = false
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)

  if (props.adsorb) { // 吸附
    adsorb()
  }
}
function contextmenuHandler(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  moveLock.value = false
}

const computedStyle = computed(() => {
  return {
    left: `${init.value.x}px`,
    top: `${init.value.y}px`,
  }
})
// ----------------------------------------------------------------

// 显示隐藏--------------------------------------------------------
let rect = { height: 0, width: 0 }
function showContent(ifShow: boolean) {
  if (!ifShow)
    return show.value = false

  show.value = true
  nextTick(() => {
    const { width, height } = rect
    let top = init.value.y - props.height + height / 2
    // 超过window或者小于0, 则取边界
    if (top < 0)
      top = 0
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (top > windowRect.height - props.height)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      top = windowRect.height - props.height
    contentRef.value!.style.left = `${init.value.x - props.width + width / 2}px`
    contentRef.value!.style.top = `${top}px`
  })
}
// -------------------------------------------------------------------

// 吸附---------------------------------------------------------------
function adsorb() {
  dragRef.value!.style.transition = 'all 0.4s'
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  init.value.x = windowRect.width - rect.width
}
// -------------------------------------------------------------------

const windowRect = { height: 0, width: 0 }
onMounted(() => {
  // 获取拖动元素的宽高
  const { height, width } = dragRef.value!.getBoundingClientRect()
  rect = { height, width }
  // 获取窗口宽高
  windowRect.height = window.innerHeight
  windowRect.width = window.innerWidth
  // 监听窗口变化
  window.addEventListener('resize', () => {
    windowRect.height = window.innerHeight
    windowRect.width = window.innerWidth
  })
  // 初始化位置
  adsorb()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      ref="contentRef"
      shadow="md"
      absolute
      :style="{ height: `${props.height}px`, width: `${props.width}px` }"
    >
      <slot name="content">
        <div p-1 text-center>
          replace me
        </div>
      </slot>
    </div>
  </Teleport>
  <Teleport to="body">
    <div
      ref="dragRef"
      class="w-10 h-10 rounded-full shadow cursor-pointer border-none"
      bg="teal-600 hover:teal-700"
      flex justify-center items-center
      absolute
      :style="computedStyle"
      @dblclick="showContent(!show)"
      @mousedown="mousedownHandler"
      @contextmenu="contextmenuHandler"
    >
      <slot name="bar">
        <div i-ic:outline-send-time-extension text-xl bg-white />
      </slot>
    </div>
  </Teleport>
</template>
