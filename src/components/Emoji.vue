<script setup lang='ts'>
import data from 'emoji-mart-vue-fast/data/all.json'
import 'emoji-mart-vue-fast/css/emoji-mart.css'

// Vue 3, import components from `/src`:
// @ts-expect-error
import { EmojiIndex, Picker } from 'emoji-mart-vue-fast/src'

type EmojiType = 'apple' | 'google' | 'twitter' | 'messenger'

defineProps({
  emojiType: {
    type: String as PropType<EmojiType>,
    default: 'apple',
  },
})

const emits = defineEmits(['select'])

// Create emoji data index.
// We can change it (for example, filter by category) before passing to the component.
const emojiIndex = new EmojiIndex(data)

function showEmoji(emoji: any) {
  emits('select', emoji.native)
}
</script>

<template>
  <div>
    <Picker :data="emojiIndex" :set="emojiType" @select="showEmoji" />
  </div>
</template>
