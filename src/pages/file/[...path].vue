<template>
  <div>
    PATH: {{ queryPath }}
    <pre>{{ file }}</pre>
  </div>
</template>

<script setup lang="ts">
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'

definePageMeta({
  layout: 'single-file',
})

const route = useRoute()

const queryPath = computed(() => {
  if (Array.isArray(route.params.path)) return route.params.path.join('/')
  return route.params.path
})
const { data: file } = await useFetch('/api/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath.value,
  },
  transform: parseGhRepoContentsToCDNFile,
})
</script>
