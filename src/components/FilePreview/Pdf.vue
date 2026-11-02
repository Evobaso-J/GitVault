<template>
  <div class="relative overflow-auto rounded-lg bg-elevated">
    <!-- Covers both the pdf.js chunk download and the first render -->
    <USkeleton
      v-if="!isReady"
      aria-busy="true"
      class="absolute inset-0 bg-accented"
    />
    <ClientOnly>
      <VuePdfEmbed
        v-if="source.download_url"
        :source="source.download_url"
        @rendered="isReady = true"
        @loading-failed="isReady = true"
        @rendering-failed="isReady = true"
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

const props = defineProps<DocumentFilePreviewProps>()

const isReady = ref(false)
watch(() => props.source.download_url, () => isReady.value = false)
</script>
