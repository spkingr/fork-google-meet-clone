// @use luluui loading
export function useLoading(target?: Ref<HTMLElement>) {
  const targetDOM = target?.value || document.body
  const loading = ref(false)

  // 实现遮罩层的代码
  function createMask() {
    // 获取元素的宽高
    const rect = targetDOM.getBoundingClientRect()
    const { width: targetWidth, height: targetHeight } = rect

    const mask = document.createElement('div')
    mask.className = '__mask__'
    const style = `
      width: ${targetWidth}px;
      height: ${targetHeight}px;
      position: absolute;
      top: ${rect.top}px;
      left: ${rect.left}px;
      background-color: rgba(0, 0, 0, 0.2);
      display: flex;
      justify-content: center;
      align-items: center;
    `
    mask.setAttribute('style', style)
    const loading = createLoading()
    mask.innerHTML = loading

    document.body.appendChild(mask)
  }

  function createLoading() {
    return '<ui-loading size="3"></ui-loading>'
  }

  // 关闭loading
  function close() {
    loading.value = false
  }

  // 开启loading
  function open() {
    loading.value = true
  }

  const unwatch = watch(
    () => loading.value,
    (val) => {
      if (val)
        return createMask()
      const mask = document.querySelector('.__mask__')
      mask && document.body.removeChild(mask)
    },
    { immediate: true },
  )

  window.addEventListener('resize', () => {
    if (loading.value) {
      const mask = document.querySelector('.__mask__')
      mask && document.body.removeChild(mask)
      createMask()
    }
  })

  onScopeDispose(() => {
    unwatch()
    window.removeEventListener('resize', () => {})
  })

  return { loading, close, open }
}
