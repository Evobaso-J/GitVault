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
  </UContainer>
</template>

<script setup lang='ts'>
import type { BreadcrumbLink, DropdownItem } from '#ui/types'

const route = useRoute()
const links = computed<BreadcrumbLink[]>(() => {
  const linksFromRoute = route.fullPath.split('/').filter(Boolean).map((path, index, array) => ({
    label: path,
    to: '/' + array.slice(0, index + 1).join('/'),
  }))

  return [{
    label: 'Home',
    to: '/',
  }, ...linksFromRoute]
})

const { t } = useI18n()
const { open } = useUploadFile({
  multiple: false,
})

const dropdownItems: DropdownItem[][] = [
  [{
    label: t('newFolder'),
    icon: 'i-mdi-folder-plus',
  }],
  [{
    label: t('uploadFile'),
    icon: 'i-mdi-upload',
    click: open,
  }],
]
</script>
