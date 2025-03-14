<template>
  <div class="flex flex-col gap-6">
    <FoldersSection
      v-if="folders.length"
      :folders="folders"
    />
    <FilesSection
      v-if="files.length"
      :files="files"
    />
    <div
      v-if="!folders.length && !files.length"
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
          @click="open"
        />
      </EmptySectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInterval } from '@vueuse/core'

import EmptySectionCard from '~/components/EmptySectionCard.vue'
import { isFileExcluded } from '~/config'
import type { CDNFile } from '~/resources/CDNFiles'
import { parseGhRepoContentsToCDNFiles } from '~/resources/CDNFiles/parse'
import type { CDNFolder } from '~/resources/CDNFolders'
import { parseGhRepoContentsToCDNFolders } from '~/resources/CDNFolders/parse'
import type { _height } from '#tailwind-config/theme'

const { t } = useI18n()
useHead({
  title: t('folders'),
})
definePageMeta({
  middleware: ['00-auth', 'initialize-repo'],
})

const { queryPath } = useRouteQueryPath()
const { params: { repo } } = useRoute()

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

const { open } = useUploadFile(ref({ multiple: false }))
</script>
