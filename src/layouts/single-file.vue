<template>
  <UContainer>
    <UBreadcrumb
      :links="links"
      class="my-6"
    />

    <slot />
  </UContainer>
</template>

<script setup lang='ts'>
import type { BreadcrumbLink } from '#ui/types'

const route = useRoute()
const links = computed<BreadcrumbLink[]>(() => {
  const linksFromRoute = route.fullPath.split('/')
    .filter(pathSection => !!pathSection && pathSection !== 'file')
    .map((path, index, array) => ({
      label: path,
      to: '/' + array.slice(0, index + 1).join('/'),
    }))

  return [{
    label: 'Home',
    to: '/',
  }, ...linksFromRoute]
})
</script>
