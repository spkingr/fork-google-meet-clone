import type { ExtractPropTypes } from 'vue'

export const adsorbProps = {
  width: {
    type: Number,
    default: 200,
  },
  height: {
    type: Number,
    default: 200,
  },
  adsorb: {
    type: Boolean,
    default: true,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
} as const

export type NoAdsorbProps = ExtractPropTypes<typeof adsorbProps>
