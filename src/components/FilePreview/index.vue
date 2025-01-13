<template>
  <FilePreviewCode
    v-if="codeFileExtensions.includes(fileExtension)"
    :source="props.source"
  />
  <FilePreviewText
    v-else-if="textFileExtensions.includes(fileExtension)"
    :source="props.source"
  />
  <FilePreviewImage
    v-else-if="imageFileExtensions.includes(fileExtension)"
    :source="props.source"
  />
  <FilePreviewVideo
    v-else-if="videoFileExtensions.includes(fileExtension)"
    :source="props.source"
  />
  <FilePreviewPdf
    v-else-if="documentFileExtensions.includes(fileExtension)"
    :source="props.source"
  />
  <FilePreviewFallback
    v-else
    :source="props.source"
  />
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'
import { codeFileExtensions, documentFileExtensions, getFileExtension, imageFileExtensions, textFileExtensions, videoFileExtensions } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FilePreview' })
export type FilePreviewProps = {
  source: CDNFile
}
const props = defineProps<FilePreviewProps>()

const fileExtension = computed(() => getFileExtension(props.source.name))
</script>
