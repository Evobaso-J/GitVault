<template>
  <div>
    <UDropdownMenu
      :items="dropdownItems"
      :content
    >
      <slot name="activator" />
    </UDropdownMenu>
    <CreateFolderModal v-model="isModalOpen" />
  </div>
</template>

<script setup lang='ts'>
import type { DropdownMenuItem, DropdownMenuProps } from '@nuxt/ui'

defineComponent({ name: 'CreateItemsDropdown' })

interface CreateItemDropdownProps {
  content?: DropdownMenuProps['content']
}

defineProps<CreateItemDropdownProps>()

const isModalOpen = ref(false)

const { pickAndUpload } = useVaultContents()

const { t } = useI18n()

const dropdownItems: DropdownMenuItem[][] = [
  [{
    label: t('newFolder'),
    icon: 'i-mdi-folder-plus-outline',
    onSelect: () => isModalOpen.value = true,
  }],
  [{
    label: t('uploadFile'),
    icon: 'i-mdi-upload-outline',
    onSelect: () => pickAndUpload(),
  }],
]
</script>
