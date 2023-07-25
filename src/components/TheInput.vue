<script setup lang="ts">
defineProps({ placeholder: String })
const value = defineModel()
</script>

<template>
  <label for="input" flex items-center>
    <div i-material-symbols:keyboard mr-2 cursor-pointer text-2xl />
    <input
      id="input"
      v-model="value"
      :placeholder="placeholder"
      p="x-4 y-2"
      w="!250px" h="!48px"
      text="center"
      bg="transparent"
      border="~ rounded gray-500 dark:gray-800"
    >
  </label>
</template>
