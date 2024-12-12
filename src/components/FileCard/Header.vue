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
      :sha
    />
  </span>
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'

defineComponent({ name: 'FileCardHeader' })
export interface FileCardHeaderProps extends FileCardProps {}
defineProps<FileCardHeaderProps>()
</script>
