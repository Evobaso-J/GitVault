<template>
  <div class="flex items-center justify-center overflow-hidden rounded-lg bg-elevated">
    <img
      v-if="source.download_url"
      class="max-h-full max-w-full object-contain"
      :src="source.download_url"
      :alt="source.name"
    >
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'ImageFilePreview' })
defineProps<FilePreviewProps>()
</script>
