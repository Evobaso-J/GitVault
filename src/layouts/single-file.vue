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
  const linksFromRoute = route.path.split('/')
    .filter(pathSection => !!pathSection && pathSection !== route.params.repo && pathSection !== 'file')
    .map((path, index, array) => ({
      label: decodeURIComponent(path),
      to: `/${route.params.repo}/${array.slice(0, index + 1).join('/')}`,
    }))

  return [{
    label: t('home'),
    to: `/${route.params.repo}`,
  }, ...linksFromRoute]
})
</script>
