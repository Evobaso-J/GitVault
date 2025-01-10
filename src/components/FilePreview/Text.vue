<template>
  <UCard
    :ui="{
      // UCard Config: https://ui.nuxt.com/components/card#config
      body: {
        background: 'bg-neutral-100 dark:bg-neutral-800',
      },
      footer: {
        base: 'text-sm text-neutral-500 dark:text-neutral-400',
      },
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

defineComponent({ name: 'TextFilePreview' })
type TextFilePreviewProps = FilePreviewProps
const props = defineProps<TextFilePreviewProps>()

const parsedContent = computed(() => {
  return atob(props.source.content)
})
</script>
