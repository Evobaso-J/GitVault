<template>
  <div class="flex justify-end gap-0.5">
    <div class="hidden sm:flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
      <UButton
        :aria-label="$t('downloadFile', { name: file.name })"
        icon="i-mdi-download-outline"
        color="neutral"
        variant="ghost"
        @click="download(file)"
      />
      <UButton
        :aria-label="$t('copyLinkOf', { name: file.name })"
        icon="i-mdi-link-variant"
        color="neutral"
        variant="ghost"
        @click="copyLink(file)"
      />
    </div>
    <UDropdownMenu
      :items
      :content="{ align: 'end' }"
    >
      <UButton
        :aria-label="$t('moreActions', { name: file.name })"
        icon="i-mdi-dots-vertical"
        color="neutral"
        variant="ghost"
      />
    </UDropdownMenu>
  </div>
</template>

<script setup lang='ts'>
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CDNFile } from '~/resources/CDNFiles'

defineComponent({ name: 'FolderContentsRowActions' })
const props = defineProps<{ file: CDNFile }>()

const { t } = useI18n()
const { getFileUrl, download, copyLink, replace } = useFileActions()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { label: t('download'), icon: 'i-mdi-download-outline', onSelect: () => download(props.file) },
    { label: t('copyLink'), icon: 'i-mdi-link-variant', onSelect: () => copyLink(props.file) },
  ],
  [
    { label: t('openInNewTab'), icon: 'i-mdi-open-in-new', to: getFileUrl(props.file), target: '_blank' },
    { label: t('replace'), icon: 'i-mdi-autorenew', onSelect: () => replace(props.file) },
  ],
])
</script>
