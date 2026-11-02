<template>
  <div class="relative flex items-center justify-center overflow-hidden rounded-lg bg-elevated">
    <USkeleton
      v-if="!isLoaded"
      aria-busy="true"
      class="absolute inset-0 bg-accented"
    />
    <img
      v-if="source.download_url"
      class="max-h-full max-w-full object-contain"
      :src="source.download_url"
      :alt="source.name"
      @load="isLoaded = true"
      @error="isLoaded = true"
    >
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'ImageFilePreview' })
const props = defineProps<FilePreviewProps>()

const isLoaded = ref(false)
watch(() => props.source.download_url, () => isLoaded.value = false)
</script>
