<template>
  <UCard
    :ui="{
      // UCard Theme: https://ui.nuxt.com/docs/components/card#theme
      body: 'bg-neutral-100 dark:bg-neutral-800',
      footer: 'text-sm text-neutral-500 dark:text-neutral-400',
    }"
    class="overflow-x-hidden"
  >
    <div class="h-[65vh] flex justify-center items-center">
      <img
        v-if="source?.download_url"
        class="max-h-full"
        :src="source.download_url"
      >
    </div>
    <template #footer>
      {{ source.name }}
    </template>
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
