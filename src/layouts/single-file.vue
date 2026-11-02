<template>
  <UContainer>
    <UBreadcrumb
      :items="links"
      class="my-6"
    />

    <slot />
  </UContainer>
</template>

<script setup lang='ts'>
import type { BreadcrumbItem } from '@nuxt/ui'

const { t } = useI18n()
const route = useRoute()
const links = computed<BreadcrumbItem[]>(() => {
  // Drop the `vaults`, repo and `file` segments: by position, so folders named like them survive
  const linksFromRoute = route.path.split('/').filter(Boolean).slice(3)
    .map((path, index, array) => ({
      label: decodeURIComponent(path),
      to: `/vaults/${route.params.repo}/${array.slice(0, index + 1).join('/')}`,
    }))

  return [{
    label: t('home'),
    to: `/vaults/${route.params.repo}`,
  }, ...linksFromRoute]
})
</script>
