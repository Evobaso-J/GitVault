<template>
  <UInputMenu
    v-model:query="search"
    :options="filesAndFolders"
    option-attribute="path"
    by="path"
    :placeholder="$t('search')"
    size="xl"
    icon="i-mdi-magnify"
    :ui="{
      icon: { trailing: { pointer: '' } },
    }"
    :ui-menu="{
      option: { container: 'flex items-center gap-1.5 min-w-0 w-full' },
    }"
    @update:model-value="goToElement"
  >
    <template #option="{ option }">
      <div
        class="flex gap-2 w-full truncate items-center cursor-pointer"
      >
        <UIcon
          :name="option.type === 'tree' ? 'i-material-symbols-folder' : 'i-mdi-file-document-outline'"
          class="text-primary"
        />
        {{ option.path }}
      </div>
    </template>
    <template #trailing>
      <UButton
        v-show="!!search"
        class="text-gray-500"
        variant="link"
        icon="i-heroicons-x-mark-20-solid"
        :padded="false"
        @click="search = ''"
      />
    </template>
  </UInputMenu>
</template>

<script setup lang='ts'>
import { isFileExcluded } from '~/config'
import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

defineComponent({ name: 'SearchBar' })

const search = ref<string>()

const route = useRoute()

// Forces retrigger of the fetch when the route changes
const routeRepo = computed(() => route.params.repo)
const { data } = useFetch('/gh-repo-tree', {
  query: {
    recursive: 5,
    repo: routeRepo,
  },
})

const filesAndFolders = computed<GhRepoTreeResponseData['tree']>(() => data.value?.tree
  .filter(treeItem => !isFileExcluded(treeItem.path ?? '') && treeItem.path?.toLowerCase().includes(search.value?.toLowerCase() ?? '')).slice(0, 10)
  || [])

/**
 * Workaround to navigate to the selected element.
 * Currently impossible with anchor tags.
 */
const goToElement = (treeItem: GhRepoTreeResponseData['tree'][number]) => {
  const target = treeItem.type === 'tree' ? '_self' : '_blank'
  const path = treeItem.type === 'tree' ? `/${routeRepo.value}/${treeItem.path}` : `/${routeRepo.value}/file/${treeItem.path}`
  navigateTo(path, { open: { target } })
}
</script>
