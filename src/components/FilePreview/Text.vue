<template>
  <div class="overflow-auto rounded-lg bg-elevated p-4 text-sm whitespace-pre-wrap break-words">
    {{ parsedContent }}
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'
import { decodeBase64Utf8 } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'TextFilePreview' })
type TextFilePreviewProps = FilePreviewProps
const props = defineProps<TextFilePreviewProps>()

// A folder listing entry has no content until the single-file response arrives
const parsedContent = computed(() => props.source.content ? decodeBase64Utf8(props.source.content) : '')
</script>
