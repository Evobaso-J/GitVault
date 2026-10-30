<template>
  <div class="flex items-center justify-center overflow-hidden rounded-lg bg-elevated">
    <video
      v-if="source.download_url"
      class="max-h-full max-w-full"
      :src="source.download_url"
      controls
    />
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'VideoFilePreview' })
type VideoFilePreviewProps = FilePreviewProps
defineProps<VideoFilePreviewProps>()
</script>
