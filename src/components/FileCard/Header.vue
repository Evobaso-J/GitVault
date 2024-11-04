<template>
  <span class="flex items-center gap-3">
    <FileCardIcon
      :title
    />
    <span class="text-sm truncate flex-1">
      {{ title }}
    </span>
    <FileCardMenu
      :to
      :title
      :download-url="downloadUrl"
    />
  </span>
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'

defineComponent({ name: 'FileCardHeader' })
export type FileCardHeaderProps = FileCardProps
defineProps<FileCardHeaderProps>()
</script>
