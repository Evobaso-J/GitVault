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
    <!-- DO NOT PLACE THE PRE TAG IN MORE THAN ONE LINE -->
    <pre class="h-[65vh] overflow-scroll">{{ parsedContent }}</pre>
  </UCard>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'

defineComponent({ name: 'CodeFilePreview' })
type CodeFilePreviewProps = FilePreviewProps
const props = defineProps<CodeFilePreviewProps>()

const parsedContent = computed(() => {
  return atob(props.source.content)
})
</script>
