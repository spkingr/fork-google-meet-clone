import type { ExtractPropTypes } from 'vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export const messageProps = {
  content: {
    type: String,
    default: 'default content'
  },
  close: {
    type: Boolean,
    default: true
  },
  type: {
    type: String as () => MessageType,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 3000
  }
} as const

export const messageEmits = {
  'update:visible': (_visible: boolean) => true  // 这里类型会处理成boolean，但是真实用的时候又会变成any
}

export type MessageEmits = typeof messageEmits
export type MessageProps = ExtractPropTypes<typeof messageProps>

