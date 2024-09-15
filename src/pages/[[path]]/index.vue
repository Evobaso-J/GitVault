<template>
  <div>
    <FoldersSection
      :folders="mockupFolders"
    />
  </div>
</template>

<script setup lang="ts">
import type { CDNFolder } from '~/resources/CDNFolders'

const mockupFolders: CDNFolder[] = [
  { name: 'Folder Pippo', to: 'folder-pippo' },
  { name: 'Folder Wollano', to: 'folder-wollano' },
  { name: 'Folder Pasta del capitano', to: 'folder-pasta-del-capitano' },
  { name: 'Folder Stephen King', to: 'folder-stephen-king' },
]
</script>
