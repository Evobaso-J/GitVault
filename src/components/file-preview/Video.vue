<template>
  <div>
    VideoFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'VideoFilePreview' })
type VideoFilePreviewProps = FilePreviewProps
defineProps<VideoFilePreviewProps>()
</script>
