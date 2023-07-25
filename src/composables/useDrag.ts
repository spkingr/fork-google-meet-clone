import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export interface UseDragResult {
  dragFlag: Ref<boolean>
  coordinate: { x: number; y: number }
}

export function useDrag(domRef: Ref<any>, parentRef?: Ref<any>): UseDragResult {
  const dragFlag = ref(false)
  const dragStart = { x: 0, y: 0 }

  // 如果没有传入父元素的ref，则默认为body
  if (!parentRef)
    parentRef = ref(document.body)

  const unwatch = watch(
    () => domRef.value,
    (val) => {
      if (val) {
        val.addEventListener('mousedown', mousedownHanlder)
        const { left, top } = domRef.value.getBoundingClientRect()
        const { left: parentLeft, top: parentTop } = parentRef!.value.getBoundingClientRect()
        // 这里用户如果用了transform，那么就会出现问题，因为getBoundingClientRect获取的是元素在视口中的位置，而不是在文档中的位置
        domRef.value.style.left = `${left - parentLeft}px`
        domRef.value.style.top = `${top - parentTop}px`

        unwatch()
      }
    },
    { immediate: true },
  )

  function mousedownHanlder(e: MouseEvent) {
    dragFlag.value = true
    const { clientX, clientY } = e
    dragStart.x = clientX
    dragStart.y = clientY
    document.addEventListener('mousemove', mousemoveHanlder)
    document.addEventListener('mouseup', mouseupHanlder)
  }

  function mousemoveHanlder(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()

    if (!dragFlag.value)
      return
    const { clientX, clientY } = e
    const { x, y } = dragStart
    const deltaX = clientX - x
    const deltaY = clientY - y
    dragStart.x = clientX
    dragStart.y = clientY

    requestAnimationFrame(
      () => {
        const currentX = Number.parseInt(domRef.value.style.left) || 0
        const currentY = Number.parseInt(domRef.value.style.top) || 0
        domRef.value!.style.left = `${currentX + deltaX}px`
        domRef.value!.style.top = `${currentY + deltaY}px`
      },
    )
  }
  function mouseupHanlder() {
    dragFlag.value = false
    document.removeEventListener('mousemove', mousemoveHanlder)
    document.removeEventListener('mouseup', mouseupHanlder)
  }

  return {
    dragFlag,
    coordinate: dragStart,
  }
}
