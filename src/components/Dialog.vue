<script setup lang='ts'>
import { useDrag } from '~/composables/useDrag'
import { dialogEmits, dialogProps } from '~/types/comp.dialog.d'

// todo destroy-on-close 功能 => 可以参考element-plus / 参考菜总私塾7-25聊天内容
/**
 * https://play.vuejs.org/#eNqFkltr3DAQhf+Kohc7sPUS8rZ4lzYl0BbahrbQF7248tirRJaELu6C8X/vSL5sE3J5s2Y+jc4Zn4F+MKboA9AdLR23wnjiwAdzYEp0RltPBmKhISNprO5Ihmi2tj7qzsz1YhsPcRK2meJaOU8615J9vJ5nn0BKTX5rK+uL7HIBeuHEHwkz1FTSAfaYaoLiXmhFeH5JBqbIQhZ9JUPkLx4VmBqZKreTAZSOBw+dkZUHPBFSHq/Iey4Ff9gzyhk9DEMSN47l9ng1IcnMbh6L2PyFcJm8TZRQJqDud52uQSKFU5CIj68P0g31Dv01oi3unVa42mQBX8YxQoL9bqI5x+huMhd7Fe7n75dU8zbAZqnzI/CHZ+r37hRrjN5ZcGB7FLr2fGVb8FP79uc3OOH32kTlIdp6pfkDnJYhapywm6BqlP0fl9R+TikQqv3lbk8elFtMRaGRHBOPqwwQN/iS9bPc6+I63cP/iVtcEvVWNjdEq686KA/145iek2isNg5jU0MjFNzFUz6/P//nHbnRWkKFV8aUwXVmjhncHxa5cR5yhdRtnnUTEQMdL72WwFr0GBvRYGaSmOKcL34Usi63SDwJ0vgPmrI6cg==
 * https://play.vuejs.org/#eNqNVMtu2zAQ/BWGFzuAax1yc2WjrwBtgbZBW6AXXmSJkplQJMGHbMDQv3eXlGQ7cNPAMMTdnRV3hkMd6Xtjll3gdEVzV1phPHHcB7NhSrRGW0+OxPKa9KS2uiUzgM6m0kfdmiG/zDDAN53Kn0QhdTMBUjhAmCq1cp60riFr3GE++8yl1OSPtrK6md2OgE44sZV8ANWFdBxqTNVBlV5oRdxO7+e35MgUGcHLrpABW24uEkz1TOVZogkEIfC8NbLwHCJC8mHg1dC1ZnRYMRoBAImUN3lkm5oGXinYBu9hpnelFOUT9ONw0IyPPEtFAObZtC9dUO+AaS2a5aPTCs4hMmG0hB2E5PaHQZqO0VXiiLUClNp/jTlvA1+M+XLHy6cr+Ud3wByjD5Y7bjsgNNV8YRvuU/n+13d+gPVUbHUVkP4LxZ/caRlwxgT7EFQFY5/h4rRfoieEan67+4Pnyo2kcFBE9hEPkgeO4v6L+mncu+Vd7INjBRVH+/3PyAui1TcdlOfVpafTbyrOwVPrzbgvelGDj+Cg57M2IdCjPfxfclQluk25E7LKM1w+P/rTlcCxz1uxk5SycA5ctLeFMSgp6d6I+ootSe6kxgFigDolt2Zj+sr2cdpzpYgsVAMv9yD4uWqTJBcfgbdJr3RJjdXGwX2reC0Uf8AoPw5DrrYalCtUv5nfxqbXSFylm/hM6TOtaf8Xd3ibZA==
 */

const props = defineProps(dialogProps)

const emits = defineEmits(dialogEmits)

const dialog = ref<HTMLElement | null>(null)
props.drag && useDrag(dialog, null, true)

// onMounted(() => console.log('mounted'))
</script>

<template>
  <Teleport v-if="props.visible" to="body" relative>
    <div
      class="mask"
      fixed bottom-0 left-0 right-0 top-0 z-9999 bg="[rgba(0,0,0,0.2)]"
      @click="() => emits('update:visible', false)"
    />
    <div
      ref="dialog"
      class="fade-in-out"
      bg="light"
      left="50%" top="50%" translate-x="-50%" translate-y="-50%"
      absolute z-10000 flex flex-col
      rounded-1 p-1 shadow-md
      :style="{ width: `${props.width}px`, height: `${props.height}px` }"
    >
      <header h="60px" flex items-center px-2 text-gray-600>
        <slot name="header">
          {{ props.title }}
        </slot>
        <div
          i-ion:close-circle-outline absolute right-2 cursor-pointer
          bg-gray-300 text-2xl transition-300 hover:bg-gray-500
          @click="() => emits('update:visible', false)"
        />
      </header>
      <!-- default  -->
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.fade-in-out {
  animation: fade-in-out 0.5s;
}

@keyframes fade-in-out {
  0%   { opacity: 0; }
  50%  { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
