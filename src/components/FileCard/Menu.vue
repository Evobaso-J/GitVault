<template>
  <UDropdownMenu
    :items
    :content="{ align: 'start' }"
  >
    <UButton
      color="neutral"
      icon="i-mdi-dots-vertical"
      variant="ghost"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { FileCardHeaderProps } from './Header.vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { downloadFile, getPathFromNuxtLinkTo, getPathToFile } from '~/resources/CDNFiles/utils'
import type { UseUploadFileOptions } from '~/composables/useUploadFile'

defineComponent({ name: 'FileCardMenu' })
type FileCardMenuProps = FileCardHeaderProps
const props = defineProps<FileCardMenuProps>()

const { copied, copy } = useClipboard()
const { origin } = useRequestURL()
const route = useRoute()
const { t } = useI18n()

const copyPathToClipboard = () => {
  const routePath = getPathToFile({ fileName: props.to, repo: route.params.repo })
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

const items = computed<DropdownMenuItem[][]>(() => {
  const copyItem: DropdownMenuItem = copied.value
    ? {
        label: t('copied'),
        icon: 'i-mdi-check',
        disabled: true,
      }
    : {
        label: t('copyLink'),
        icon: 'i-mdi-link-variant',
        onSelect: (e: Event) => {
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
        onSelect: (e: Event) => {
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
        onSelect: () => downloadFile(props.downloadUrl!, props.title),
      },
    ],
    [
      {
        label: t('replace'),
        icon: 'i-mdi-autorenew',
        onSelect: () => replaceFile(),
      },
    ],
  ]
})
</script>
