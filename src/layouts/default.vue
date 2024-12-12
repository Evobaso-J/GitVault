<template>
  <UContainer>
    <div class="flex gap-1 my-6 items-center">
      <UBreadcrumb
        :links="links"
      />
      <UDropdown
        :items="dropdownItems"
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton
          :ui="{ rounded: 'rounded-full' }"
          variant="ghost"
          size="xs"
          icon="i-heroicons-chevron-down-20-solid"
        />
      </UDropdown>
    </div>

    <slot />
    <CreateFolderModal
      v-model="isModalOpen"
      @create-folder="closeModal"
      @cancel="closeModal"
    />
  </UContainer>
</template>

<script setup lang='ts'>
import type { BreadcrumbLink, DropdownItem } from '#ui/types'

const { t } = useI18n()
const route = useRoute()
const links = computed<BreadcrumbLink[]>(() => {
  const linksFromRoute = route.fullPath.split('/').filter(Boolean).map((path, index, array) => ({
    label: decodeURIComponent(path),
    to: '/' + array.slice(0, index + 1).join('/'),
  }))

  return [{
    label: t('home'),
    to: '/',
  }, ...linksFromRoute]
})

const isModalOpen = ref(false)
const closeModal = () => isModalOpen.value = false
const openModal = () => isModalOpen.value = true

const { open } = useUploadFile(ref({
  multiple: false,
}))

const dropdownItems: DropdownItem[][] = [
  [{
    label: t('newFolder'),
    icon: 'i-mdi-folder-plus',
    click: openModal,
  }],
  [{
    label: t('uploadFile'),
    icon: 'i-mdi-upload',
    click: open,
  }],
]
</script>
