<template>
  <div>
    DocumentFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'DocumentFilePreview' })
type DocumentFilePreviewProps = FilePreviewProps

defineProps<DocumentFilePreviewProps>()
</script>
