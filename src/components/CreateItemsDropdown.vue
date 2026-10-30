<template>
  <div>
    <UDropdownMenu
      :items="dropdownItems"
      :content
    >
      <slot name="activator" />
    </UDropdownMenu>
    <CreateNamedResourceModal
      v-model="isModalOpen"
      :title="$t('createFolder')"
      :schema="createFolderSchema"
      :initial-state="{ name: '' }"
      @submit="saveAndClose"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang='ts'>
import { z } from 'zod'
import type { DropdownMenuItem, DropdownMenuProps } from '@nuxt/ui'

defineComponent({ name: 'CreateItemsDropdown' })

interface CreateItemDropdownProps {
  content?: DropdownMenuProps['content']
}

defineProps<CreateItemDropdownProps>()

const isModalOpen = ref(false)
const closeModal = () => isModalOpen.value = false
const openModal = () => isModalOpen.value = true

const { open } = useUploadFile(ref({
  multiple: false,
}))

const { t } = useI18n()

const dropdownItems: DropdownMenuItem[][] = [
  [{
    label: t('newFolder'),
    icon: 'i-mdi-folder-plus-outline',
    onSelect: openModal,
  }],
  [{
    label: t('uploadFile'),
    icon: 'i-mdi-upload-outline',
    onSelect: () => open(),
  }],
]

const createFolderSchema = z.object({
  name: z.string().min(1).refine(name => !name.includes('/'), {
    message: t('validationError.noSlashInFolderName'),
  }),
})

const { createFolder } = useCreateFolder()
const saveAndClose = async (name: string) => {
  await createFolder(name)
  closeModal()
}
</script>
