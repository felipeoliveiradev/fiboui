
<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { FiboThemeProvider } from '../../../../src/theme'

const props = defineProps({
  component: {
    type: Function,
    required: true
  },
  builder: {
    type: Object, 
    required: false
  }
})

const container = ref(null)
let root = null

const render = () => {
  if (!container.value) return
  
  
  if (root) {
    root.unmount()
  }

  root = createRoot(container.value)
  
  
  
  
  

  const element = props.component()

  root.render(
    React.createElement(FiboThemeProvider, null, element)
  )
}

onMounted(() => {
  render()
})

watch(() => props.component, () => {
  render()
})

onBeforeUnmount(() => {
  if (root) root.unmount()
})
</script>

<template>
  <div class="react-wrapper border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-[#0B0C15] my-4 not-prose">
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.react-wrapper {
  overflow: hidden;
}
</style>
