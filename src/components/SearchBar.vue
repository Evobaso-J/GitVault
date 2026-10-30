<template>
  <UInputMenu
    v-model:search-term="search"
    :items="filesAndFolders"
    label-key="path"
    ignore-filter
    :placeholder="$t('search')"
    size="xl"
    icon="i-mdi-magnify"
    :ui="{
      itemLeadingIcon: 'text-primary',
    }"
    @update:model-value="goToElement"
  >
    <template #trailing>
      <UButton
        v-show="!!search"
        color="neutral"
        variant="link"
        icon="i-heroicons-x-mark-20-solid"
        class="p-0"
        @click="search = ''"
      />
    </template>
  </UInputMenu>
</template>

<script setup lang='ts'>
import { isFileExcluded } from '~/config'
import { getPathToFile, getPathToFolder } from '~/resources/CDNFiles/utils'
import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

defineComponent({ name: 'SearchBar' })

const search = ref('')

const route = useRoute()

// Forces retrigger of the fetch when the route changes
const routeRepo = computed(() => route.params.repo)
const { data } = useFetch('/gh-repo-tree', {
  query: {
    recursive: 5,
    repo: routeRepo,
  },
})

type SearchBarItem = {
  path: GhRepoTreeResponseData['tree'][number]['path']
  isFolder: boolean
  icon: string
}

// Mapped because UInputMenu reserves the `type` item key
const filesAndFolders = computed<SearchBarItem[]>(() => (data.value?.tree ?? [])
  .filter(treeItem => !isFileExcluded(treeItem.path ?? '') && treeItem.path?.toLowerCase().includes(search.value.toLowerCase()))
  .slice(0, 10)
  .map(treeItem => ({
    path: treeItem.path,
    isFolder: treeItem.type === 'tree',
    icon: treeItem.type === 'tree' ? 'i-material-symbols-folder' : 'i-mdi-file-document-outline',
  })))

/**
 * Workaround to navigate to the selected element.
 * Currently impossible with anchor tags.
 */
const goToElement = (treeItem: SearchBarItem) => {
  const target = treeItem.isFolder ? '_self' : '_blank'
  const getUrl = treeItem.isFolder ? getPathToFolder : getPathToFile
  navigateTo(getUrl({ path: treeItem.path, repo: routeRepo.value }), { open: { target } })
}
</script>
