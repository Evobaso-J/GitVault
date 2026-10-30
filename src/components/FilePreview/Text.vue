<template>
  <UCard
    :ui="{
      // UCard Theme: https://ui.nuxt.com/docs/components/card#theme
      body: 'bg-neutral-100 dark:bg-neutral-800',
      footer: 'text-sm text-neutral-500 dark:text-neutral-400',
    }"
    class="overflow-x-hidden"
  >
    <div class="h-[65vh] overflow-scroll">
      {{ parsedContent }}
    </div>
    <template #footer>
      {{ source.name }}
    </template>
  </UCard>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'
import { decodeBase64Utf8 } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'TextFilePreview' })
type TextFilePreviewProps = FilePreviewProps
const props = defineProps<TextFilePreviewProps>()

const parsedContent = computed(() => {
  return decodeBase64Utf8(props.source.content)
})
</script>
