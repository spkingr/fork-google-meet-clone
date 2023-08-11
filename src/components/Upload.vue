<script setup lang='ts'>
// todo: 基础版本的分片上传 未实现断点续传以及失败重传
import type { Chunk, UploadProps } from '~/types/comp.upload.d'

const props = withDefaults(defineProps<UploadProps>(), {
  target: '',
  accept: '*',
  disabled: false,
  limit: 100,
  chunksize: 1024 * 1024 * 1,
})

// upload---------------------------------------
const uploadMaskTarget = ref<HTMLElement>()
const uploadLabelTarget = ref<HTMLElement>()
const MAX_REQUEST = 6 // 最大并发数浏览器默认是6个tcp连接
const totalCount = ref(0)
const showMaskClose = ref(false)

function beforeUpload(file: File) {
  const limit = props.limit * 1024 * 1024
  if (file.size > limit) {
    useMessage.error({ content: `文件大小不能超过${props.limit}MB` })
    return false
  }
  return file
}

function sliceFile(file: File, size: number) {
  const chunks = []
  let cur = 0
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + size))
    cur += size
  }
  return chunks
}

function getMapName() {
  const options = props.chunkOptions
  return {
    index: options.index,
    total: options.total,
    name: options.name,
    size: options.size,
    identifier: options.identifier,
  }
}

function generateFormData(chunkObj: Chunk) {
  const mapName = getMapName()
  const formData = new FormData()
  formData.append(mapName.index, chunkObj.index)
  formData.append(mapName.total, chunkObj.total)
  formData.append(mapName.name, chunkObj.name)
  formData.append(mapName.size, chunkObj.size)
  formData.append(mapName.identifier, chunkObj.identifier)
  formData.append('file', chunkObj.file)

  return formData
}
function uploadFile(formData: FormData) {
  return useFetch(props.target, {
    method: 'POST',
    body: formData,
    headers: props.headers,
  })
}
function merge(file: File) {
  return useFetch(props.merge, {
    method: 'POST',
    headers: props.headers,
    body: JSON.stringify({
      name: file.name,
    }),
  })
}

function uploadMask(finish = false) {
  const target = uploadMaskTarget.value
  const uploadLabel = uploadLabelTarget.value
  if (!target || !uploadLabel)
    return
  requestAnimationFrame(() => {
    const precent = 1 / totalCount.value
    const { width } = uploadLabel.getBoundingClientRect()
    const { width: currentWidth } = target.getBoundingClientRect()
    // 判断遮罩是否拉满
    if (currentWidth >= width)
      finish = true
    // 上传完成直接拉满
    if (finish)
      return target.style.width = `${width}px`
    // 上传中
    target.style.width = `${currentWidth + precent * width}px`
  })
}

function clearMask() {
  const target = uploadMaskTarget.value
  if (!target)
    return
  target.style.width = '0px'
  showMaskClose.value = false
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  // 0. 上传遮罩
  uploadMask()
  // 1. 无文件直接返回
  if (!file)
    return
  // 2. 文件大小超过限制
  if (!beforeUpload(file))
    return

  // 3. 文件分片
  const chunks = sliceFile(file, props.chunksize)
  totalCount.value = chunks.length

  // 4. 拿到分片后的文件 生成formData 并上传
  let currentChunk = 0
  const tasks: any[] = [] // 任务队列
  while (currentChunk < chunks.length) {
    const formData = generateFormData({
      index: currentChunk.toString(),
      total: chunks.length.toString(),
      name: file.name,
      size: file.size.toString(),
      identifier: file.name,
      file: chunks[currentChunk],
    })
    const task = uploadFile(formData)
    task.then(() => {
      uploadMask() // 上传遮罩
      tasks.splice(tasks.indexOf(task), 1) // 任务完成后从队列中移除
    })
    // 将task push到队列中
    tasks.push(task)
    // 如果任务队列中的任务数等于最大并发数，就等待其中一个任务完成
    if (tasks.length === MAX_REQUEST) {
      const { data } = await Promise.race(tasks)
      const extraHandle = extraHandler(data)
      if (extraHandle[0])
        return extraHandle[0](target)
    }
    currentChunk += 1 // 任务数小于最大并发数，就继续添加任务
  }
  const datas = await Promise.all(tasks) // 任务队列中的任务全部完成
  const allResolve = datas.every(({ data }) => data.value.code === 200) // 检查是否全部上传成功
  if (!allResolve) {
    // 找到第一个上传失败的文件, 做相应处理
    const errorFile = datas.find(data => data.value.code !== 200)
    const extraHandle = extraHandler(errorFile)
    if (extraHandle[0])
      return extraHandle[0](target)
  }

  // 5. 上传完成通知合并
  const { data } = await merge(file)

  // 6. 合并如果失败
  if ((data.value as any).code !== 200)
    return mergeError(target)

  // 7. 合并成功
  uploadFinsh(target)
}

// 碎片上传可能遇到的问题处理
function extraHandler(data: any) {
  if (data.value.code === props.extra?.success) // 上传成功
    return [null]
  else if (data.value.code === props.extra?.fast) // 触发秒传
    return [uploadFinsh]
  else // 上传失败
    return [uploadError]
}

function uploadFinsh(target: HTMLInputElement) {
  uploadMask(true) // 上传遮罩拉满
  showMaskClose.value = true // 显示关闭按钮
  useMessage.success({ content: '文件上传成功' })
  target.value = ''
}

function uploadError(target: HTMLInputElement) {
  clearMask()
  useMessage.error({ content: '文件上传失败' })
  target.value = ''
}

function mergeError(target: HTMLInputElement) {
  useMessage.error({ content: '文件合并失败' })
  clearMask()
  target.value = ''
}
</script>

<template>
  <div
    h="120px" w="full" bg="gray-100"
    b="1px dashed gray-300" rounded="1"
    relative
  >
    <label
      ref="uploadLabelTarget"
      for="file-upload"
      wh-full flex-col flex-center
      cursor-move
    >
      <div h-10 w-10 i-mdi:cloud-upload-outline />
      <div text-xs color-coolgray>Upload File</div>
      <div
        ref="uploadMaskTarget"
        h-full w-0 transition duration-300
        absolute left-0 top-0 z-10
        bg="blue-300" rounded-1
        opacity-100
        @click.stop.prevent
      >
        <div
          v-if="showMaskClose"
          i-material-symbols:cancel-outline-rounded
          absolute left="50%" top="50%"
          translate-x="-50%" translate-y="-50%"
          p-2
          color="red"
          cursor-pointer
          @click.stop.prevent="clearMask"
        />
      </div>
    </label>
    <input
      id="file-upload"
      type="file"
      invisible
      :disabled="props.disabled"
      :accept="props.accept"
      @change="handleChange"
    >
  </div>
</template>
