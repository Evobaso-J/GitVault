<template>
  <UEmpty
    :avatar="{ icon: 'i-mdi-upload-outline', class: 'bg-primary/10 rounded-xl', ui: { icon: 'text-primary' } }"
    :title="$t('emptyFolder.title', { folder })"
    :description="$t('emptyFolder.description')"
    :actions="[
      { label: $t('chooseFiles'), icon: 'i-mdi-upload-outline', onClick: () => pickAndUpload() },
      { label: $t('newFolder'), icon: 'i-mdi-folder-plus-outline', color: 'neutral', variant: 'outline', onClick: () => { isFolderModalOpen = true } },
    ]"
    size="xl"
    class="min-h-96 border-2 border-dashed border-primary/30 bg-primary/5"
  >
    <template #footer>
      <CreateFolderModal v-model="isFolderModalOpen" />
    </template>
  </UEmpty>
</template>

<script setup lang='ts'>
defineComponent({ name: 'FolderContentsEmpty' })
defineProps<{ folder: string }>()

const isFolderModalOpen = ref(false)
const { pickAndUpload } = useVaultContents()
</script>
