<template>
  <div>
    CodeFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'CodeFilePreview' })
type CodeFilePreviewProps = FilePreviewProps
defineProps<CodeFilePreviewProps>()
</script>
