<template>
  <UCard
    :ui="{
      rounded: 'rounded-none rounded-b-lg',
      background: 'bg-gray-50 dark:bg-gray-800',
      ring: 'ring-0',
      body: {
        base: 'h-36',
        padding: 'p-0 sm:p-0',
      },
    }"
    class="overflow-hidden"
  >
    <template v-if="downloadUrl">
      <img
        class="w-full h-full object-cover"
        :src="downloadUrl"
      >
    </template>
    <div
      v-else
      class="flex items-center justify-around px-4 py-5 sm:p-6"
    >
      <FileCardIcon
        :title="fileName"
        size="lg"
      />
    </div>
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
