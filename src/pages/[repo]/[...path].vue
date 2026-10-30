<template>
  <div class="flex gap-6">
    <div
      ref="dropTarget"
      class="relative flex-1 min-w-0 flex flex-col gap-3"
    >
      <FolderContentsLoading v-if="status === 'pending' && !data" />
      <FolderContentsError
        v-else-if="error"
        :error
        :parent
        @retry="refresh()"
      />
      <template v-else-if="folders.length || files.length">
        <p class="text-sm text-muted">
          {{ summary }}
        </p>
        <FolderContentsTable
          :folders
          :files
          :selected="selectedFile?.name"
        />
        <p class="hidden md:flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-primary/30 text-sm text-muted">
          <UIcon
            name="i-mdi-upload-outline"
            class="size-4"
          />
          {{ $t('dropZone.hint', { location }) }}
        </p>
      </template>
      <FolderContentsEmpty
        v-else
        :folder="folderName"
      />

      <div
        v-if="isOverDropZone"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm pointer-events-none"
      >
        <UIcon
          name="i-mdi-upload"
          class="size-10 text-primary"
        />
        <span class="text-lg font-semibold text-highlighted">{{ $t('dropZone.title') }}</span>
        <span class="text-sm text-muted">{{ location }}</span>
      </div>
    </div>

    <aside
      v-if="selectedFile && isDesktop"
      class="w-96 shrink-0 border-l border-default pl-6"
    >
      <FolderContentsPreviewPanel
        :file="selectedFile"
        @close="closePreview"
      />
    </aside>
    <USlideover
      :open="!!selectedFile && !isDesktop"
      @update:open="open => !open && closePreview()"
    >
      <template #content>
        <FolderContentsPreviewPanel
          v-if="selectedFile"
          :file="selectedFile"
          class="p-4 overflow-y-auto"
          @close="closePreview"
        />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints, useDropZone, useInterval } from '@vueuse/core'

import { isFileExcluded } from '~/config'
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFiles } from '~/resources/CDNFiles/parse'
import type { CDNFolder } from '~/resources/CDNFolders'
import { getPathToFolder } from '~/resources/CDNFiles/utils'
import { parseGhRepoContentsToCDNFolders } from '~/resources/CDNFolders/parse'

const { t } = useI18n()
useHead({
  title: t('folders'),
})
definePageMeta({
  middleware: ['00-auth', '03-active-repo'],
})

const route = useRoute()
const { queryPath } = useRouteQueryPath()
const { params: { repo } } = route

const downloadUrlTokenDuration = useInterval(5 * 60 * 1000)

// Not awaited: the page renders its loading state while the folder is fetched
const { data, status, error, refresh } = useFetch('/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath,
    repo,
  },
  // Refetch every 5 minutes to update the download_url permission token
  watch: [downloadUrlTokenDuration],
})

const folders = computed<CDNFolder[]>(() => parseGhRepoContentsToCDNFolders(data.value ?? []))
const files = computed<CDNFile[]>(() => parseGhRepoContentsToCDNFiles(data.value ?? []).filter(file => !isFileExcluded(file.name)))

const summary = computed(() => [
  t('folderCount', folders.value.length),
  t('fileCount', files.value.length),
  formatBytes(files.value.reduce((total, file) => total + file.size, 0)),
].join(' · '))

// The previewed file lives in the query, so the folder URL is a deep link to it
const selectedFile = computed(() => files.value.find(file => file.name === route.query.file))
const closePreview = () => navigateTo({ query: { ...route.query, file: undefined } })

const folderName = computed(() => queryPath.value?.split('/').pop() ?? String(repo))
const parent = computed(() => {
  if (!queryPath.value) return undefined
  const parentPath = queryPath.value.split('/').slice(0, -1).join('/')
  return {
    name: parentPath.split('/').pop() || String(repo),
    to: getPathToFolder({ path: parentPath, repo }),
  }
})

const location = computed(() => [repo, ...(queryPath.value?.split('/') ?? [])].join(' / '))
const { upload } = useVaultContents()
const dropTarget = useTemplateRef('dropTarget')
const { isOverDropZone } = useDropZone(dropTarget, {
  onDrop: files => files?.length && upload(files),
  multiple: true,
})

const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('lg')
</script>
