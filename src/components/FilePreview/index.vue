<template>
  <FilePreviewCode
    v-if="fileCategory === 'code'"
    :source="props.source"
  />
  <FilePreviewText
    v-else-if="fileCategory === 'text'"
    :source="props.source"
  />
  <FilePreviewImage
    v-else-if="fileCategory === 'image'"
    :source="props.source"
  />
  <FilePreviewVideo
    v-else-if="fileCategory === 'video'"
    :source="props.source"
  />
  <FilePreviewPdf
    v-else-if="fileCategory === 'pdf'"
    :source="props.source"
  />
  <FilePreviewFallback
    v-else
    :source="props.source"
  />
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'
import { getFileCategory } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FilePreview' })
export type FilePreviewProps = {
  source: CDNFile
}
const props = defineProps<FilePreviewProps>()

const fileCategory = computed(() => getFileCategory(props.source.name))
</script>
