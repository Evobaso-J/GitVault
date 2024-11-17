<template>
  <UCard
    :ui="{
      // UCard Config: https://ui.nuxt.com/components/card#config
      background: 'bg-gray-700',
    }"
    class="text-white overflow-x-hidden"
  >
    <template #header>
      {{ source.name }}
    </template>
    <div class="h-[65vh] flex justify-center items-center">
      <img
        v-if="source?.download_url"
        class="max-h-full"
        :src="source.download_url"
      >
    </div>
  </UCard>
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'

defineComponent({ name: 'ImageFilePreview' })
type ImageFilePreviewProps = {
  source: CDNFile
}
defineProps<ImageFilePreviewProps>()
</script>
