<template>
  <div
    v-if="file"
    class="flex flex-col gap-4"
  >
    <header class="flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-56 flex flex-col">
        <h1 class="font-semibold break-words">
          {{ file.name }}
        </h1>
        <span class="text-sm text-muted">{{ $t(`fileCategory.${getFileCategory(file.name)}`) }} · {{ formatBytes(file.size) }}</span>
      </div>
      <UButton
        :label="$t('copyLink')"
        icon="i-mdi-link-variant"
        color="neutral"
        variant="outline"
        @click="copyLink(file)"
      />
      <UButton
        :label="$t('replace')"
        icon="i-mdi-autorenew"
        color="neutral"
        variant="outline"
        @click="replace(file)"
      />
      <UButton
        :label="$t('download')"
        icon="i-mdi-download-outline"
        @click="download(file)"
      />
    </header>
    <FilePreview
      :source="file"
      class="h-[75vh]"
    />
  </div>
</template>

<script setup lang="ts">
import { useInterval } from '@vueuse/core'
import { parseGhRepoContentsToCDNFile } from '~/resources/CDNFiles/parse'
import { getFileCategory } from '~/resources/CDNFiles/utils'

definePageMeta({
  layout: 'single-file',
  middleware: ['00-auth', '03-active-repo'],
})

const { queryPath } = useRouteQueryPath()
const downloadUrlTokenDuration = useInterval(5 * 60 * 1000)
const { params: { repo } } = useRoute()

const { data: file } = await useFetch('/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath,
    repo,
  },
  transform: parseGhRepoContentsToCDNFile,
  // Refetch every 5 minutes to update the download_url permission token
  watch: [downloadUrlTokenDuration],
})

useHead({
  title: file.value?.name,
})

const { copyLink, replace, download } = useFileActions()
</script>
