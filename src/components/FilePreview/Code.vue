<template>
  <!-- DO NOT PLACE THE PRE TAG IN MORE THAN ONE LINE -->
  <pre class="overflow-auto rounded-lg bg-elevated p-4 text-xs">{{ parsedContent }}</pre>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'
import { decodeBase64Utf8 } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'CodeFilePreview' })
type CodeFilePreviewProps = FilePreviewProps
const props = defineProps<CodeFilePreviewProps>()

// A folder listing entry has no content until the single-file response arrives
const parsedContent = computed(() => props.source.content ? decodeBase64Utf8(props.source.content) : '')
</script>
