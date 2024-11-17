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
      {{ parsedContent }}
    </div>
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
