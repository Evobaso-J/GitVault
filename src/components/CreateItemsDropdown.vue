<template>
  <div>
    <UDropdown
      :items="dropdownItems"
      :popper
    >
      <slot name="activator" />
    </UDropdown>
    <CreateFolderModal
      v-model="isModalOpen"
      @create-folder="closeModal"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang='ts'>
import type { DropdownItem, PopperOptions } from '#ui/types'

defineComponent({ name: 'CreateItemsDropdown' })

interface CreateItemDropdownProps {
  popper?: PopperOptions
}

defineProps<CreateItemDropdownProps>()

const isModalOpen = ref(false)
const closeModal = () => isModalOpen.value = false
const openModal = () => isModalOpen.value = true

const { open } = useUploadFile(ref({
  multiple: false,
}))

const { t } = useI18n()
const dropdownItems: DropdownItem[][] = [
  [{
    label: t('newFolder'),
    icon: 'i-mdi-folder-plus-outline',
    click: openModal,
  }],
  [{
    label: t('uploadFile'),
    icon: 'i-mdi-upload-outline',
    click: open,
  }],
]
</script>
