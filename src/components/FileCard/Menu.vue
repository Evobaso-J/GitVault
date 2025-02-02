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
import { downloadFile, getPathFromNuxtLinkTo, getPathToFile } from '~/resources/CDNFiles/utils'
import type { UseUploadFileOptions } from '~/composables/useUploadFile'

defineComponent({ name: 'FileCardMenu' })
interface FileCardMenuProps extends FileCardHeaderProps {}
const props = defineProps<FileCardMenuProps>()

const { copied, copy } = useClipboard()
const { origin } = useRequestURL()
const route = useRoute()
const { t } = useI18n()

const copyPathToClipboard = () => {
  const routePath = getPathFromNuxtLinkTo(props.to)
  const fullPath = new URL(routePath, origin)
  copy(fullPath.toString())
}

const uploadFileOptions = computed<UseUploadFileOptions>(() => ({
  multiple: false,
  replace: {
    path: getPathFromNuxtLinkTo(props.to),
    sha: props.sha,
  },
}))
const { open: replaceFile } = useUploadFile(uploadFileOptions)

const items = computed<DropdownItem[][]>(() => {
  const copyItem: DropdownItem = copied.value
    ? {
        label: t('copied'),
        icon: 'i-mdi-check',
        disabled: true,
      }
    : {
        label: t('copyLink'),
        icon: 'i-mdi-link-variant',
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
        to: getPathToFile({ fileName: props.to, repo: route.params.repo }),
        target: '_blank',
      },
    ],
    [
      copyItem,
    ],
    [
      {
        label: t('download'),
        icon: 'i-mdi-download-outline',
        disabled: !props.downloadUrl,
        click: (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          return downloadFile(props.downloadUrl!, props.title)
        },
      },
    ],
    [
      {
        label: t('replace'),
        icon: 'i-mdi-autorenew',
        click: (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          replaceFile()
        },
      },
    ],
  ]
})
</script>
