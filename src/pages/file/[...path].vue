<template>
  <div>
    PATH: {{ queryPath }}
    <pre>{{ file }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'

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

const file = computed<CDNFile | null>(() =>
  parseGhRepoContentsToCDNFile(data.value),
)
</script>
