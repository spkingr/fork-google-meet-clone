// 这个是名字的映射-----------------------
export interface ChunkOption {
  index: string // 当前分片索引
  total: string // 总分片数
  name: string // 文件名
  size: string // 文件大小
  identifier: string // 文件唯一标识
}
// --------------------------------------

export interface UploadProps {
  target: string // 上传地址
  merge: string // 合并地址
  chunkOptions: ChunkOption
  accept?: string
  disabled?: boolean
  limit?: number // MB
  chunksize?: number // 分片大小
  headers?: Record<string, string>
  extra?: {
    success: number // 成功code
    fast: number // 秒传code
  }
}

export interface Chunk extends ChunkOption {
  file: Blob // 文件
}
