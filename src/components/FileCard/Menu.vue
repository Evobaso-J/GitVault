<template>
  <UDropdown
    :items
    :popper="{ placement: 'bottom-start' }"
  >
    <UButton
      color="gray"
      icon="i-mdi-dots-vertical"
      variant="ghost"
    />
  </UDropdown>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { FileCardHeaderProps } from './Header.vue'
import type { DropdownItem } from '#ui/types'
import { downloadFile, getPathFromNuxtLinkTo } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FileCardMenu' })
type FileCardMenuProps = FileCardHeaderProps
const props = defineProps<FileCardMenuProps>()

const { copied, copy } = useClipboard()
const { origin } = useRequestURL()
const { t } = useI18n()

const copyPathToClipboard = () => {
  const routePath = getPathFromNuxtLinkTo(props.to)
  const fullPath = new URL(routePath, origin)
  copy(fullPath.toString())
}

defineShortcuts({
  meta_c: copyPathToClipboard,
})

const items = computed<DropdownItem[][]>(() => {
  const copyItem: DropdownItem = copied.value
    ? {
        label: t('copied'),
        icon: 'i-mdi-check',
        disabled: true,
      }
    : {
        label: t('copyLink'),
        icon: 'i-mdi-content-copy',
        shortcuts: ['Ctrl', 'C'],
        click: (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          copyPathToClipboard()
        },
      }
  return [
    [
      {
        label: t('openInNewTab'),
        icon: 'i-mdi-open-in-new',
        click: (e: Event) => {
          e.stopPropagation()
        },
        to: `/file${props.to}`,
        target: '_blank',
      },
    ],
    [
      copyItem,
    ],
    [
      {
        label: t('download'),
        icon: 'i-mdi-download',
        slot: 'download',
        disabled: !props.downloadUrl,
        click: (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          return downloadFile(props.downloadUrl!, props.title)
        },
      },
    ],
  ]
})
</script>
