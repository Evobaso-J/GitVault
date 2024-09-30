<template>
  <div>
    <FoldersSection
      :folders="data ?? []"
    />
  </div>
</template>

<script setup lang="ts">
import { parseGhRepoContentsToCDNFolder } from '~/resources/CDNFolders/parse'

const route = useRoute()

const queryPath = computed(() => {
  if (Array.isArray(route.params.path)) return route.params.path.join('/')
  return route.params.path
})
const { data } = useFetch('/api/ghRepoContents', {
  method: 'GET',
  query: {
    path: queryPath.value,
  },
  transform: parseGhRepoContentsToCDNFolder,
})
</script>
