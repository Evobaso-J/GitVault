<template>
  <span class="flex items-center gap-3">
    <span>
      <FileCardIcon
        :title
      />
    </span>
    <span class="text-sm truncate">
      {{ title }}
    </span>
  </span>
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'

defineComponent({ name: 'FileCardHeader' })
type FileCardHeaderProps = Pick<FileCardProps, 'title'>
defineProps<FileCardHeaderProps>()
</script>
