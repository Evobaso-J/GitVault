<template>
  <div class="overflow-auto rounded-lg bg-elevated">
    <ClientOnly
      fallback-tag="span"
      fallback="Loading PDF..."
    >
      <VuePdfEmbed
        v-if="source.download_url"
        :source="source.download_url"
      >
        <template #after-page>
          <div class="mb-2" />
        </template>
      </VuePdfEmbed>
    </ClientOnly>
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

// Import component asynchronously to prevent SSR issues
// https://github.com/hrynko/vue-pdf-embed?tab=readme-ov-file#server-side-rendering
const VuePdfEmbed = defineAsyncComponent(() => import('vue-pdf-embed'))

defineComponent({ name: 'DocumentFilePreview' })
type DocumentFilePreviewProps = FilePreviewProps

defineProps<DocumentFilePreviewProps>()
</script>
