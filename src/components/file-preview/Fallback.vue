<template>
  <div>
    FallbackFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'FallbackFilePreview' })
type FallbackFilePreviewProps = FilePreviewProps

defineProps<FallbackFilePreviewProps>()
</script>
