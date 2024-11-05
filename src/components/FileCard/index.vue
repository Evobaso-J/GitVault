<template>
  <ULink
    :to="`/file/${to}`"
  >
    <UCard
      :ui="{
        // UCard Config: https://ui.nuxt.com/components/card#config
        body: {
          padding: 'px-0 pt-3 pb-0 sm:px-0 sm:pt-3 sm:pb-0',
        },
        ring: 'hover:ring-gray-400 dark:hover:ring-gray-500',
      }"
      class="min-w-56 min-h-48"
    >
      <FileCardHeader
        :title
        :to
        :download-url="downloadUrl"
        class="mb-2 px-4"
      />
      <FileCardPreview
        class="px-0"
        :file-name="title"
      />
    </UCard>
  </ULink>
</template>

<script setup lang='ts'>
import type { NuxtLinkProps } from '#app'

defineComponent({ name: 'FileCard' })
export type FileCardProps = {
  title: string
  to: NuxtLinkProps['to']
  downloadUrl: string | null
}

defineProps<FileCardProps>()
</script>
