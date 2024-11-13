<template>
  <div>
    TextFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'TextFilePreview' })
type TextFilePreviewProps = FilePreviewProps
defineProps<TextFilePreviewProps>()
</script>
