<template>
  <div class="mb-6">
    <AppToolbar />
    <UContainer>
      <div class="flex gap-1 my-6 items-center">
        <UBreadcrumb
          :links="links"
        />
        <CreateItemsDropdown
          :popper="{ placement: 'bottom-start' }"
        >
          <template #activator>
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              variant="ghost"
              size="xs"
              icon="i-heroicons-chevron-down-20-solid"
            />
          </template>
        </CreateItemsDropdown>
      </div>

      <slot />
    </UContainer>
    <CreateItemsDropdown
      class="fixed bottom-6 right-6 md:hidden"
      :popper="{ placement: 'top-end' }"
    >
      <template #activator>
        <UButton
          icon="i-mdi-plus"
          :label="$t('create')"
          size="xl"
        />
      </template>
    </CreateItemsDropdown>
  </div>
</template>

<script setup lang='ts'>
import type { BreadcrumbLink } from '#ui/types'

const { t } = useI18n()
const route = useRoute()
const links = computed<BreadcrumbLink[]>(() => {
  const linksFromRoute = route.path.split('/').filter(Boolean).map((path, index, array) => ({
    label: decodeURIComponent(path),
    to: '/' + array.slice(0, index + 1).join('/'),
  }))

  return [{
    label: t('home'),
    to: '/',
  }, ...linksFromRoute]
})
</script>
