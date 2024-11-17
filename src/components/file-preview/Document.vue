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
    <div class="h-[65vh] overflow-scroll">
      <VuePdfEmbed
        v-if="source.download_url"
        :source="source.download_url"
      >
        <template #after-page>
          <div class="mb-2" />
        </template>
      </VuePdfEmbed>
    </div>
  </UCard>
</template>

<script setup lang='ts'>
import VuePdfEmbed from 'vue-pdf-embed'
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'DocumentFilePreview' })
type DocumentFilePreviewProps = FilePreviewProps

defineProps<DocumentFilePreviewProps>()
</script>
