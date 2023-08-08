// @use ikun loading
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
    // ikun svg
    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 1500 1315" version="1.1">
        <title>ikun</title>
        <g id="ikun" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <circle id="ball2" fill="#FF7802" cx="161.5" cy="926.5" r="146.5">
              <animateTransform attributeName="transform" type="translate" values="1180 0;1180 0;590 240;0 0" keyTimes="0;0.5;0.75;1" keySplines="0 0 1 1;0.5 0 1 1;0 0 0.5 1" calcMode="spline" begin="0s" dur="1s" repeatCount="indefinite" fill="freeze"/>
              <animate attributeType="XML" attributeName="opacity" values="0;1;1;1" keyTimes="0;0.5;0.75;1" begin="0s" dur="1s" calcMode="discrete" repeatCount="indefinite" fill="freeze"/> 
          </circle>
          <polygon id="bodyBG" fill="#FFFFFF" points="750.192515 180.192515 1305.69251 736.599765 750.192515 1293.00702 194.692515 736.599766"/>
          <path d="M750.493037,181.006963 L1111.993,542.506963 L1111.993,932.492963 L750.493037,1293.99304 L399.993,943.492963 L399.993,531.506963 L750.493037,181.006963 Z M800.993037,1114 L705.993037,1114 L705.993037,1209 L800.993037,1209 L800.993037,1114 Z M800.993037,973 L705.993037,973 L705.993037,1068 L800.993037,1068 L800.993037,973 Z M800.993037,832 L705.993037,832 L705.993037,927 L800.993037,927 L800.993037,832 Z M367.993,563.506963 L367.993,911.492963 L194,737.5 L367.993,563.506963 Z M1143.993,574.506963 L1306.98607,737.5 L1143.993,900.492963 L1143.993,574.506963 Z M800.993037,691 L705.993037,691 L705.993037,786 L800.993037,786 L800.993037,691 Z M800.993037,550 L705.993037,550 L705.993037,645 L800.993037,645 L800.993037,550 Z" id="body" fill="#000000"/>
          <polygon id="hair" fill="#989898" points="567.140656 0.359343673 749.574206 182.792893 932.007755 0.359343673 1115.14841 183.5 749.574206 549.074206 384 183.5"/>
          <circle id="ball1" fill="#FF7802" cx="161.5" cy="926.5" r="146.5">
              <animateTransform attributeName="transform" type="translate" values="0 0;590 240;1180 0;1180 0" keyTimes="0;0.25;0.5;1" keySplines="0.5 0 1 1;0 0 0.5 1;0 0 1 1" calcMode="spline" begin="0s" dur="1s" repeatCount="indefinite" fill="freeze"/>
              <animate attributeType="XML" attributeName="opacity" values="1;1;0;0" keyTimes="0;0.25;0.5;1" begin="0s" dur="1s" repeatCount="indefinite" calcMode="discrete" fill="freeze"/> 
          </circle>
        </g>
      </svg>
    `
  }

  // 关闭loading
  function close() {
    loading.value = false
  }

  // 开启loading
  function open() {
    loading.value = true
  }

  function checkMask() {
    const mask = document.querySelector('.__mask__')
    mask && document.body.removeChild(mask)
  }

  const unwatch = watch(
    () => loading.value,
    (val) => {
      if (val)
        return createMask()
      checkMask()
    },
    { immediate: true },
  )

  const resize = () => {
    if (loading.value) {
      checkMask()
      createMask()
    }
  }

  window.addEventListener('resize', resize)

  onScopeDispose(() => {
    unwatch()
    window.removeEventListener('resize', resize)
  })

  return { loading, close, open }
}
