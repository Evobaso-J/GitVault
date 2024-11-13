<template>
  <component
    :is="filePreviewComponent"
    v-if="filePreviewComponent"
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

const filePreviewComponent = computed(() => {
  const extension = getFileExtension(props.source.name)
  if (codeFileExtensions.includes(extension)) return resolveComponent('FilePreviewCode')
  if (textFileExtensions.includes(extension)) return resolveComponent('FilePreviewText')
  if (imageFileExtensions.includes(extension)) return resolveComponent('FilePreviewImage')
  if (videoFileExtensions.includes(extension)) return resolveComponent('FilePreviewVideo')
  if (documentFileExtensions.includes(extension)) return resolveComponent('FilePreviewDocument')
  return resolveComponent('FilePreviewFallback')
})
</script>
