<template>
  <UIcon
    :name="fileIcon"
    class="w-6 h-6 text-gray-500"
  />
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'
import type { FileExtension } from '~/resources/CDNFiles'
import { getExtensionFromFileName } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FileCardIcon' })
type FileCardIconProps = Pick<FileCardProps, 'title'>
const props = defineProps<FileCardIconProps>()

const codeFileExtensions: FileExtension[] = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json', '.md', '.html', '.css', '.yaml', '.yml']
const imageFileExtensions: FileExtension[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
const videoFileExtensions: FileExtension[] = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']

const fileIcon = computed(() => {
  const fileExtension = getExtensionFromFileName(props.title)
  if (fileExtension === '.pdf') return 'i-material-symbols-picture-as-pdf-outline'
  if (codeFileExtensions.includes(fileExtension)) return 'i-material-symbols-code'
  if (imageFileExtensions.includes(fileExtension)) return 'i-material-symbols-image'
  if (videoFileExtensions.includes(fileExtension)) return 'i-material-symbols-video'
  return 'i-material-symbols-file-copy'
})
</script>
