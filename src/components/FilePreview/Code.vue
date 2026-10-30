<template>
  <UCard
    :ui="{
      // UCard Theme: https://ui.nuxt.com/docs/components/card#theme
      body: 'bg-neutral-100 dark:bg-neutral-800',
      footer: 'text-sm text-neutral-500 dark:text-neutral-400',
    }"
    class="overflow-x-hidden"
  >
    <!-- DO NOT PLACE THE PRE TAG IN MORE THAN ONE LINE -->
    <pre class="h-[65vh] overflow-scroll">{{ parsedContent }}</pre>
    <template #footer>
      {{ source.name }}
    </template>
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
