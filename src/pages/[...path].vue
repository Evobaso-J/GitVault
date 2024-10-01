<template>
  <div class="flex flex-col gap-6">
    <FoldersSection
      :folders="folders"
    />
    <FilesSection
      :files="files"
    />
  </div>
</template>

<script setup lang="ts">
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'
import type { CDNFolder } from '~/resources/CDNFolders'
import { parseGhRepoContentsToCDNFolder } from '~/resources/CDNFolders/parse'

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

const folders = computed<CDNFolder[]>(() => parseGhRepoContentsToCDNFolder(data.value ?? []))
const files = computed<CDNFile[]>(() => parseGhRepoContentsToCDNFile(data.value ?? []))
</script>
