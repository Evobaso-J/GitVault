<template>
  <ULink
    :to="getPathToFile({ path: to, repo: $route.params.repo })"
    target="_blank"
  >
    <UCard
      :ui="{
        // UCard Theme: https://ui.nuxt.com/docs/components/card#theme
        body: 'px-0 pt-3 pb-0 sm:px-0 sm:pt-3 sm:pb-0',
      }"
      class="min-h-48 hover:ring-gray-400 dark:hover:ring-gray-500"
    >
      <FileCardHeader
        :title
        :to
        :download-url="downloadUrl"
        :sha
        class="mb-2 px-4"
      />
      <FileCardPreview
        :file-name="title"
        :download-url="getDownloadUrl()"
      />
    </UCard>
  </ULink>
</template>

<script setup lang='ts'>
import type { NuxtLinkProps } from '#app'
import { getPathToFile, getFileCategory } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FileCard' })

export interface FileCardProps {
  title: string
  to: Exclude<NuxtLinkProps['to'], undefined>
  downloadUrl: string | null
  sha: string
}

const props = defineProps<FileCardProps>()
const getDownloadUrl = () => {
  const category = getFileCategory(props.title)
  if (category === 'image') return props.downloadUrl
  return undefined
}
</script>
