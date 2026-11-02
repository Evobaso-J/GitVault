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
        :label="$t('rename')"
        icon="i-mdi-rename-outline"
        color="neutral"
        variant="outline"
        @click="rename(file)"
      />
      <UButton
        :label="$t('delete')"
        icon="i-mdi-trash-can-outline"
        color="error"
        variant="outline"
        @click="remove(file)"
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
  <div
    v-else-if="status === 'pending'"
    aria-busy="true"
    class="flex flex-col gap-4"
  >
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-56 flex flex-col gap-2">
        <USkeleton class="h-5 w-1/2" />
        <USkeleton class="h-4 w-32" />
      </div>
      <USkeleton
        v-for="n in 5"
        :key="n"
        class="h-8 w-28"
      />
    </div>
    <USkeleton class="h-[75vh] rounded-lg" />
    <span
      role="status"
      class="sr-only"
    >{{ $t('loading') }}</span>
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

// Not awaited: the page renders its skeleton while the file is fetched
const { data: file, status } = useFetch('/gh-repo-contents', {
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
  // A getter: a rename keeps this page mounted and swaps the file
  title: () => file.value?.name,
})

const { copyLink, replace, rename, download, remove } = useFileActions()
</script>
