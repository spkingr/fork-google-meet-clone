import type { ExtractPropTypes } from 'vue'

export const dialogProps = {
  visible: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 520
  },
  height: {
    type: Number,
    default: 300
  },
  title:{
    type: String,
    default: 'DIALOG'
  },
  drag: {
    type: Boolean,
    default: false
  }
} as const

export const dialogEmits = {
  'update:visible': (_visible: boolean) => true  // 这里类型会处理成boolean，但是真实用的时候又会变成any
}

export type DialogEmits = typeof dialogEmits
export type DialogProps = ExtractPropTypes<typeof dialogProps>
