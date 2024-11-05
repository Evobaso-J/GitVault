<template>
  <div class="flex flex-col gap-6">
    <FoldersSection
      v-if="folders.length"
      :folders="folders"
    />
    <FilesSection
      v-if="files.length"
      :files="files"
    />
  </div>
</template>

<script setup lang="ts">
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFiles } from '~/resources/CDNFiles/parse'
import type { CDNFolder } from '~/resources/CDNFolders'
import { parseGhRepoContentsToCDNFolders } from '~/resources/CDNFolders/parse'

const route = useRoute()

const queryPath = computed(() => {
  if (Array.isArray(route.params.path)) return route.params.path.join('/')
  return route.params.path
})
const { data } = await useFetch('/api/ghRepoContents', {
  method: 'GET',
  query: {
    path: queryPath.value,
  },
})

const folders = computed<CDNFolder[]>(() => parseGhRepoContentsToCDNFolders(data.value))
const files = computed<CDNFile[]>(() => parseGhRepoContentsToCDNFiles(data.value))
</script>
