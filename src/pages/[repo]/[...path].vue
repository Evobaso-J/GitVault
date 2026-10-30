<template>
  <div class="flex gap-6">
    <div class="flex-1 min-w-0 flex flex-col gap-3">
      <template v-if="folders.length || files.length">
        <p class="text-sm text-muted">
          {{ summary }}
        </p>
        <FolderContentsTable
          :folders
          :files
          :selected="selectedFile?.name"
        />
      </template>
      <div
        v-else
        class="flex justify-center"
      >
        <EmptySectionCard
          :title="$t('emptyFolder.title')"
          :description="$t('emptyFolder.description')"
          icon="i-mdi-cloud-question-outline"
        >
          <UButton
            block
            variant="outline"
            icon="i-mdi-upload-outline"
            size="xl"
            :label="$t('uploadFile')"
            @click="pickAndUpload()"
          />
        </EmptySectionCard>
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
import { breakpointsTailwind, useBreakpoints, useInterval } from '@vueuse/core'

import EmptySectionCard from '~/components/EmptySectionCard.vue'
import { isFileExcluded } from '~/config'
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFiles } from '~/resources/CDNFiles/parse'
import type { CDNFolder } from '~/resources/CDNFolders'
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

const { data } = await useFetch('/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath,
    repo,
  },
  // Refetch every 5 minutes to update the download_url permission token
  watch: [downloadUrlTokenDuration],
})

const folders = computed<CDNFolder[]>(() => parseGhRepoContentsToCDNFolders(data.value))
const files = computed<CDNFile[]>(() => parseGhRepoContentsToCDNFiles(data.value).filter(file => !isFileExcluded(file.name)))

const summary = computed(() => [
  t('folderCount', folders.value.length),
  t('fileCount', files.value.length),
  formatBytes(files.value.reduce((total, file) => total + file.size, 0)),
].join(' · '))

// The previewed file lives in the query, so the folder URL is a deep link to it
const selectedFile = computed(() => files.value.find(file => file.name === route.query.file))
const closePreview = () => navigateTo({ query: { ...route.query, file: undefined } })

const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('lg')

const { pickAndUpload } = useVaultContents()
</script>
