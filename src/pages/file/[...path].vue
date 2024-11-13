<template>
  <div>
    <details>
      <summary>PATH</summary>
      <pre>{{ file }}</pre>
      <a
        v-if="file?.download_url"
        :href="file.download_url"
        target="_blank"
      >DOWNLOAD URL</a>
    </details>
    <details>
      <summary>CONTENT</summary>
      <img
        v-if="file?.content"
        :src="`data:image/gif;base64,${file.content}`"
      >
    </details>
    <details>
      <summary>CONTENT FROM DOWNLOAD URL</summary>
      <img
        v-if="file?.download_url"
        :src="file.download_url"
      >
    </details>
    <FilePreview
      v-if="file"
      :source="file"
    />
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
