<template>
  <UCard
    :ui="{
      rounded: 'rounded-none rounded-b-lg',
      background: 'bg-gray-50 dark:bg-gray-800',
      ring: 'ring-0',
    }"
    class="flex items-center justify-around"
  >
    <FileCardIcon
      :title="fileName"
      size="lg"
    />
  </UCard>
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'

defineComponent({ name: 'FileCardPreview' })
type FileCardPreviewProps = {
  fileName: FileCardProps['title']
  downloadUrl?: FileCardProps['downloadUrl']
}
defineProps<FileCardPreviewProps>()
</script>
