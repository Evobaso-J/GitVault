<template>
  <UTable
    :data="rows"
    :columns
    :meta
    class="border border-default rounded-lg"
    @select="(_event, row) => navigateTo(row.original.to)"
  >
    <template #name-cell="{ row }">
      <ULink
        :to="row.original.to"
        class="flex items-center gap-3 min-w-0 font-medium text-highlighted"
      >
        <UIcon
          :name="row.original.icon"
          class="size-5 shrink-0"
          :class="row.original.file ? 'text-muted' : 'text-primary'"
        />
        <span class="truncate">{{ row.original.name }}</span>
      </ULink>
    </template>
    <template #actions-cell="{ row }">
      <FolderContentsRowActions
        v-if="row.original.file"
        :file="row.original.file"
        @click.stop
      />
    </template>
  </UTable>
</template>

<script setup lang='ts'>
import type { RouteLocationRaw } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import type { CDNFile } from '~/resources/CDNFiles'
import type { CDNFolder } from '~/resources/CDNFolders'
import { getFileCategory, getIconFromFileName, getPathToFolder } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FolderContentsTable' })

type FolderContentsTableProps = {
  folders: CDNFolder[]
  files: CDNFile[]
  /** Name of the file shown in the preview panel */
  selected?: string
}
const props = defineProps<FolderContentsTableProps>()

type Row = {
  name: string
  to: RouteLocationRaw
  icon: string
  type: string
  size: string
  file?: CDNFile
}

const route = useRoute()
const { t } = useI18n()

const rows = computed<Row[]>(() => [
  ...props.folders.map(folder => ({
    name: folder.name,
    to: getPathToFolder({ path: folder.to, repo: route.params.repo }),
    icon: 'i-mdi-folder',
    type: t('folder'),
    size: '',
  })),
  ...props.files.map(file => ({
    name: file.name,
    // The preview opens beside the list: the folder URL stays a deep link to it
    to: { query: { file: file.name } },
    icon: getIconFromFileName(file.name),
    type: t(`fileCategory.${getFileCategory(file.name)}`),
    size: formatBytes(file.size),
    file,
  })),
])

const columns: TableColumn<Row>[] = [
  { accessorKey: 'name', header: t('name') },
  { accessorKey: 'type', header: t('type'), meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell text-muted' } } },
  { accessorKey: 'size', header: t('size'), meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell text-muted' } } },
  { id: 'actions', meta: { class: { td: 'w-0 text-right' } } },
]

const meta = {
  class: {
    tr: (row: { original: Row }) => [
      'group cursor-pointer',
      row.original.file && row.original.name === props.selected ? 'bg-elevated' : '',
    ].join(' '),
  },
}
</script>
