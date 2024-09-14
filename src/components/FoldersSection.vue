<template>
  <section>
    <h6 class="text-lg mb-4">
      {{ $t('folders') }}
    </h6>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="folder in folders"
        :key="folder.title"
        class="col-span-1"
      >
        <FolderCard
          :title="folder.title"
          :to="folder.to"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang='ts'>
import type { Folder } from '~/resources/folders'

defineComponent({ name: 'FoldersSection' })

type FoldersSectionProps = {
  folders: Folder[]
}
defineProps<FoldersSectionProps>()
</script>
