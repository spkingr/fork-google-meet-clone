import type { ExtractPropTypes } from 'vue'

export const moveProps = {
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: 100,
  },
  x: {
    type: Number,
    default: 100,
  },
  y: {
    type: Number,
    default: 100,
  },
} as const

export type NoMoveProps = ExtractPropTypes<typeof moveProps>
