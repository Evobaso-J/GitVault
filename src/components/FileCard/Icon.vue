<template>
  <UIcon
    :name="fileIcon"
    class="text-gray-500 text-8xl"
    :class="{
      'size-6': size==='md',
      'size-24': size === 'lg',
    }"
  />
</template>

<script setup lang='ts'>
import type { FileCardProps } from './index.vue'
import { getIconFromFileName } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FileCardIcon' })
type FileCardIconProps = Pick<FileCardProps, 'title'> & {
  size?: 'md' | 'lg'
}
const props = withDefaults(defineProps<FileCardIconProps>(), {
  size: 'md',
})

const fileIcon = computed(() => getIconFromFileName(props.title))
</script>
