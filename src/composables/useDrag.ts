import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseDragResult {
  dragFlag: Ref<boolean>
  coordinate: { x: number; y: number }
}

function getComputedStyle(dom: HTMLElement) {
  const element = dom
  const computedStyle = window.getComputedStyle(element)
  const transformValue = computedStyle.transform
  // 提取偏移值
  // 只关注 translateX 和 translateY 值
  const translateX = Number.parseFloat(transformValue.split(',')[4])
  const translateY = Number.parseFloat(transformValue.split(',')[5])

  return [translateX, translateY]
}

export function useDrag(
  /* dom ref */
  domRef: Ref<any>,
  /* 父元素 dom 是指定位上的父级 */
  parentRef?: Ref<any> | null,
  /* watch 是否长时间执行 如果不是使用在dialog等会弹出消失的元素上 使用默认值false就行 */
  watchLonger?: Boolean,
): UseDragResult {
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
        const [tx, ty] = getComputedStyle(domRef.value)
        domRef.value.style.left = `${left - parentLeft - tx}px`
        domRef.value.style.top = `${top - parentTop - ty}px`

        !watchLonger && unwatch()
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

  onScopeDispose(() => {
    unwatch()
  })

  return {
    dragFlag,
    coordinate: dragStart,
  }
}
