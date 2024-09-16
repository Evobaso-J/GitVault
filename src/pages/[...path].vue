<template>
  <div>
    <FoldersSection
      :folders="data ?? []"
    />
  </div>
</template>

<script setup lang="ts">
import type { CDNFolder } from '~/resources/CDNFolders'

const route = useRoute()

const parseGhFolderToCDNFolder = (folders: any[]): CDNFolder[] => {
  // Filter folders by 'dir' type and map them to CDNFolder
  return folders.reduce((acc, folder) => {
    if (folder.type === 'dir') {
      acc.push({
        name: folder.name,
        to: `/${folder.path}`,
      })
    }
    return acc
  }, [])
}
const queryPath = computed(() => {
  if (Array.isArray(route.params.path)) return route.params.path.join('/')
  return route.params.path
})
const { data } = useFetch('/api/folders', {
  query: {
    path: queryPath.value,
  },
  transform: parseGhFolderToCDNFolder,
})
</script>
