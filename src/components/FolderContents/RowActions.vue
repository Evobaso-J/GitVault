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
      v-if="isDesktop"
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

    <!-- On touch screens the actions open in a sheet from the bottom, with tap-sized rows -->
    <UDrawer
      v-else
      v-model:open="isDrawerOpen"
      :title="file.name"
      :description="`${formatBytes(file.size)} · ${file.path}`"
    >
      <UButton
        :aria-label="$t('moreActions', { name: file.name })"
        icon="i-mdi-dots-vertical"
        color="neutral"
        variant="ghost"
      />
      <template #body>
        <nav class="flex flex-col">
          <UButton
            v-for="item in items.flat()"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :to="item.to"
            :target="item.target"
            :color="item.color ?? 'neutral'"
            variant="ghost"
            size="xl"
            class="h-12"
            @click="select(item)"
          />
        </nav>
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang='ts'>
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { CDNFile } from '~/resources/CDNFiles'

defineComponent({ name: 'FolderContentsRowActions' })
const props = defineProps<{ file: CDNFile }>()

const { t } = useI18n()
const { getFileUrl, download, copyLink, replace, remove } = useFileActions()

const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('md')
const isDrawerOpen = ref(false)

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { label: t('preview'), icon: 'i-mdi-eye-outline', onSelect: () => navigateTo({ query: { file: props.file.name } }) },
    { label: t('download'), icon: 'i-mdi-download-outline', onSelect: () => download(props.file) },
    { label: t('copyLink'), icon: 'i-mdi-link-variant', onSelect: () => copyLink(props.file) },
  ],
  [
    { label: t('openInNewTab'), icon: 'i-mdi-open-in-new', to: getFileUrl(props.file), target: '_blank' },
    { label: t('replace'), icon: 'i-mdi-autorenew', onSelect: () => replace(props.file) },
    ...(props.file.html_url ? [{ label: t('viewOnGitHub'), icon: 'i-mdi-github', to: props.file.html_url, target: '_blank' }] : []),
  ],
  [
    { label: t('delete'), icon: 'i-mdi-trash-can-outline', color: 'error', onSelect: () => remove(props.file) },
  ],
])

const select = (item: DropdownMenuItem) => {
  isDrawerOpen.value = false
  item.onSelect?.(new Event('select'))
}
</script>
