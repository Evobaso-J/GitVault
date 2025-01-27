<template>
  <NuxtLink
    :to="`/${currentRepo}`"
    class="cursor-pointer"
  >
    <NuxtImg
      src="/images/logo.svg"
      alt="Logo"
      width="40"
    />
  </NuxtLink>
</template>

<script setup lang='ts'>
import { DEFAULT_REPO_NAME } from '~/config'

defineComponent({ name: 'AppLogo' })

const route = useRoute()
const currentRepo = computed(() => {
  if (!route.params.repo || Array.isArray(route.params.repo)) {
    return DEFAULT_REPO_NAME
  }
  return route.params.repo
})
</script>
