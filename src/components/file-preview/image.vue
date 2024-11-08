<template>
  <div>
    ImageFilePreview
  </div>
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'

defineComponent({ name: 'ImageFilePreview' })
type ImageFilePreviewProps = {
  source: CDNFile
}
defineProps<ImageFilePreviewProps>()
</script>
