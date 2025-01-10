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

const { t } = useI18n()
useHead({
  title: t('folders'),
})

const { queryPath } = useRouteQueryPath()

const downloadUrlTokenDuration = useInterval(5 * 60 * 1000)

const { data } = await useFetch('/api/gh-repo-contents', {
  method: 'GET',
  query: {
    path: queryPath.value,
  },
  // Refetch every 5 minutes to update the download_url permission token
  watch: [downloadUrlTokenDuration],
})

const route = useRoute()
const searchFilterCallback = (file: CDNFile | CDNFolder) => {
  let searchString = route.query?.search ?? ''
  if (Array.isArray(searchString)) {
    searchString = ''
  }
  else {
    searchString = searchString.toLowerCase()
  }
  return file.name.toLowerCase().includes(searchString)
}

const folders = computed<CDNFolder[]>(() => parseGhRepoContentsToCDNFolders(data.value).filter(searchFilterCallback))
const files = computed<CDNFile[]>(() => parseGhRepoContentsToCDNFiles(data.value).filter(file => !isFileExcluded(file.name) && searchFilterCallback(file)))

const { open } = useUploadFile(ref({ multiple: false }))
</script>
