<script setup lang='ts' name="NoMoveable">
// 拖动和缩放的start坐标实际上可以共用，因为每次操作的时候，只会有一个生效，但是为了方便理解，还是分开写
import { computed, ref } from 'vue'
import { moveProps } from '~/types/comp.moveable.d'

const props = defineProps(moveProps)
// 基础配置--------------------------------------
const initStyle = ref({
  width: props.width,
  height: props.height,
  left: props.x,
  top: props.y,
})
const scaleableStyle = computed(() => {
  return {
    width: `${initStyle.value.width}px`,
    height: `${initStyle.value.height}px`,
    left: `${initStyle.value.left}px`,
    top: `${initStyle.value.top}px`,
  }
})

// 选中状态 ------------------------------------
const selected = ref(false)
function clickHanlder(e: MouseEvent) {
  e.stopPropagation()
  selected.value = true
}
// 点击任意非选中区域，取消选中状态
document.addEventListener('click', () => {
  selected.value = false
})

// 方位--------------------------------------------------------------
type Orientation = 'lt' | 'rt' | 'rb' | 'lb' | 't' | 'r' | 'b' | 'l'
const orientation: Orientation[] = ['lt', 'rt', 'rb', 'lb', 't', 'r', 'b', 'l']

// 拖动--------------------------------------------------------------
const moveLock = ref(false)
const dragStart = { x: 0, y: 0 }
const delta = { x: 0, y: 0 }
function mousedownHandler(e: MouseEvent) {
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

  // 通过delta.x和delta.y来改变组件的left和top
  initStyle.value.left += delta.x
  initStyle.value.top += delta.y
}
function mouseupHandler(e: MouseEvent) {
  moveLock.value = false
  document.removeEventListener('mousemove', mousemoveHandler)
  document.removeEventListener('mouseup', mouseupHandler)
}
// ----------------------------------------------------------------

// 缩放------------------------------------------------------------
const scaleLock = ref(false)
const startScale = { x: 0, y: 0 }
const deltaScale = { x: 0, y: 0 }
let scaleItem = ''
function mousedownScaleHandler(e: MouseEvent, item: string) {
  scaleLock.value = true
  const { clientX, clientY } = e
  startScale.x = clientX
  startScale.y = clientY
  scaleItem = item
  document.addEventListener('mousemove', mousemoveScaleHandler)
  document.addEventListener('mouseup', mouseupScaleHandler)
}
function mousemoveScaleHandler(e: MouseEvent) {
  if (!scaleLock.value)
    return
  const { clientX, clientY } = e
  deltaScale.x = clientX - startScale.x
  deltaScale.y = clientY - startScale.y

  // 拖拽不同的点的时候，我们要改变的component的属性不同
  // 当拖拽含有l的点的时候，我们要改变的是left和width
  // 当拖拽含有t的点的时候，我们要改变的是top和height
  // 当拖拽含有r的点的时候，我们要改变的是width
  // 当拖拽含有b的点的时候，我们要改变的是height

  // 根据上述规则修改wrapper宽高和位置
  if (scaleItem.includes('l')) {
    initStyle.value.width -= deltaScale.x
    initStyle.value.left += deltaScale.x
  }
  if (scaleItem.includes('t')) {
    initStyle.value.height -= deltaScale.y
    initStyle.value.top += deltaScale.y
  }
  if (scaleItem.includes('r'))
    initStyle.value.width += deltaScale.x

  if (scaleItem.includes('b'))
    initStyle.value.height += deltaScale.y

  startScale.x = clientX
  startScale.y = clientY
}
function mouseupScaleHandler(e: MouseEvent) {
  scaleLock.value = false
  document.removeEventListener('mousemove', mousemoveScaleHandler)
  document.removeEventListener('mouseup', mouseupScaleHandler)
}
// ----------------------------------------------------------------
</script>

<template>
  <div
    :class="{ selected, 'moveable-wrapper': !selected }"
    :style="scaleableStyle"
    absolute z-2147483647
    @click="clickHanlder"
    @mousedown="mousedownHandler"
    @contextmenu.prevent="moveLock = false"
  >
    <slot />
    <template v-for="(item) of orientation" :key="item">
      <div
        v-if="selected"
        w="10px" h="10px" rounded-1 bg-blue-400
        absolute
        :class="item"
        class="bigger"
        hover:cursor-move
        @mousedown.stop="($event) => mousedownScaleHandler($event, item)"
      />
    </template>
  </div>
</template>

<style scoped>
.moveable-wrapper::after {
  content: ' ';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 144, 255, 0.1);
}
.selected {
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.3);
}
.t {
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
.r {
  top: 50%;
  right: 0;
  transform: translateX(50%) translateY(-50%);
}
.b {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(50%);
}
.l {
  top: 50%;
  left: 0;
  transform: translateX(-50%) translateY(-50%);
}
.lt {
  top: 0;
  left: 0;
  transform: translateX(-50%) translateY(-50%);
}
.rt {
  top: 0;
  right: 0;
  transform: translateX(50%) translateY(-50%);
}
.rb {
  bottom: 0;
  right: 0;
  transform: translateX(50%) translateY(50%);
}
.lb {
  bottom: 0;
  left: 0;
  transform: translateX(-50%) translateY(50%);
}
.bigger::after {
  content: ' ';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
}
</style>
