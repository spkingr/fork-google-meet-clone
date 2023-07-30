<script setup lang='ts'>
import dayjs from 'dayjs'

const TODAY = dayjs().format('dddd YYYY-MM-DD')

const TITLE = import.meta.env.VITE_TITLE
</script>

<template>
  <div h="100vh" overflow-x-hidden>
    <header h="80px" flex items-center justify-between p="x-4" shadow-md>
      <div h-full flex items-center text-xl font-800>
        <div i-logos:google-meet mr-4 text-3xl />
        <h3> {{ TITLE }} </h3>
      </div>
      <h3 h-full flex items-center font-bold>
        <span mr-2 font-900>{{ TODAY }}</span>
        <div
          class="i-material-symbols:edit-calendar-outline-sharp"
          cursor-pointer transition-300
          hover:bg-blue-400
        />
      </h3>
    </header>
    <div h="[calc(100vh-80px)]">
      <slot />
    </div>
  </div>
</template>
