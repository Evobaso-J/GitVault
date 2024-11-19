<template>
  <FilePreview
    v-if="file"
    :source="file"
  />
</template>

<script setup lang="ts">
import { useInterval } from '@vueuse/core'
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'

definePageMeta({
  layout: 'single-file',
})

const route = useRoute()

const queryPath = computed(() => {
  if (Array.isArray(route.params.path)) return route.params.path.join('/')
  return route.params.path
})

const downloadUrlTokenDuration = useInterval(5 * 60 * 1000)

const { data: file } = await useFetch('/api/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath.value,
  },
  transform: parseGhRepoContentsToCDNFile,
  // Refetch every 5 minutes to update the download_url permission token
  watch: [downloadUrlTokenDuration],
})
</script>
