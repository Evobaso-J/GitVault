<template>
  <section>
    <h6 class="text-lg mb-4">
      {{ $t('files') }}
    </h6>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="file in files"
        :key="file.name"
        class="col-span-1"
      >
        <FileCard
          :title="file.name"
          :to="file.path"
          :download-url="file.download_url"
          :sha="file.sha"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang='ts'>
import type { CDNFile } from '~/resources/CDNFiles'

defineComponent({ name: 'FoldersSection' })

type FilesSectionProps = {
  files: CDNFile[]
}
defineProps<FilesSectionProps>()
</script>
