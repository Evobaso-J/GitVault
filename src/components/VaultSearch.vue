<template>
  <UButton
    :aria-label="$t('searchVault')"
    icon="i-mdi-magnify"
    color="neutral"
    variant="outline"
    class="sm:w-64 text-muted"
    @click="open = true"
  >
    <span class="hidden sm:inline flex-1 text-left">{{ $t('searchVault') }}</span>
    <span class="hidden sm:flex gap-0.5">
      <UKbd value="meta" />
      <UKbd value="K" />
    </span>
  </UButton>

  <UModal
    v-model:open="open"
    :title="$t('searchVault')"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #content>
      <UCommandPalette
        :groups
        :loading="status === 'pending'"
        :placeholder="$t('searchPlaceholder')"
        close
        class="max-h-[28rem]"
        @update:open="value => open = value"
      >
        <template #footer>
          <div class="flex gap-4 px-2 text-xs text-muted">
            <span>↑↓ {{ $t('palette.move') }}</span>
            <span>↵ {{ $t('palette.open') }}</span>
            <span>esc {{ $t('palette.close') }}</span>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script setup lang='ts'>
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { getVaultLabel, isFileExcluded } from '~/config'
import { getIconFromFileName, getPathToFolder } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'VaultSearch' })

const RESULTS_PER_GROUP = 8

const open = ref(false)
defineShortcuts({ meta_k: () => open.value = !open.value })

const route = useRoute()
const { t } = useI18n()
const { queryPath } = useRouteQueryPath()
const { repositoryNames } = useRepoStorage()
const { pickAndUpload } = useVaultContents()

const repo = computed(() => String(route.params.repo))

// The whole tree is fetched once per vault, when the palette first opens
const { data, status, execute } = useFetch('/gh-repo-tree', {
  query: { repo },
  immediate: false,
  watch: false,
})
watch(open, (isOpen) => {
  if (isOpen && status.value === 'idle') execute()
})
watch(repo, () => status.value !== 'idle' && execute())

const go = (to: string | { path: string, query: Record<string, string> }) => {
  open.value = false
  navigateTo(to)
}

/** `docs/2026/a.txt` → [`docs/2026`, `a.txt`] */
const splitPath = (path: string): [string, string] => {
  const slash = path.lastIndexOf('/')
  return [path.slice(0, slash > 0 ? slash : 0), path.slice(slash + 1)]
}

const limit = (_searchTerm: string, items: CommandPaletteItem[]) => items.slice(0, RESULTS_PER_GROUP)

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  const tree = (data.value?.tree ?? []).filter(item => item.path && !isFileExcluded(splitPath(item.path)[1]))
  const toItem = (path: string, isFolder: boolean): CommandPaletteItem => {
    const [parent, name] = splitPath(path)
    return {
      label: name,
      suffix: parent,
      icon: isFolder ? 'i-mdi-folder' : getIconFromFileName(name),
      // A file opens in the preview panel of its folder, not on a new page
      onSelect: () => go(isFolder
        ? getPathToFolder({ path, repo: repo.value })
        : { path: getPathToFolder({ path: parent, repo: repo.value }), query: { file: name } }),
    }
  }
  return [
    { id: 'folders', label: t('folders'), items: tree.filter(item => item.type === 'tree').map(item => toItem(item.path!, true)), postFilter: limit },
    { id: 'files', label: t('files'), items: tree.filter(item => item.type === 'blob').map(item => toItem(item.path!, false)), postFilter: limit },
    {
      id: 'actions',
      label: t('palette.actions'),
      items: [{
        label: t('palette.uploadHere', { location: queryPath.value ? `/${queryPath.value}` : repo.value }),
        icon: 'i-mdi-upload-outline',
        onSelect: () => {
          open.value = false
          pickAndUpload()
        },
      }],
    },
    {
      id: 'vaults',
      label: t('vaults'),
      items: repositoryNames.value
        .filter(name => name !== repo.value)
        .map(name => ({ label: getVaultLabel(name), icon: 'i-mdi-archive-outline', onSelect: () => go(`/${name}`) })),
    },
  ]
})
</script>
