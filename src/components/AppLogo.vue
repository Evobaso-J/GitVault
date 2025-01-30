<template>
  <NuxtLink
    :to="`/${currentRepo}`"
    class="cursor-pointer"
  >
    <NuxtImg
      src="/images/logo.svg"
      alt="Logo"
      :width="size"
    />
  </NuxtLink>
</template>

<script setup lang='ts'>
import { DEFAULT_REPO_NAME } from '~/config'

defineComponent({ name: 'AppLogo' })

type AppLogoProps = {
  /**
   * The pixel size of the logo.
   */
  size: string
}

withDefaults(defineProps<AppLogoProps>(), {
  size: '40',
})

const route = useRoute()
const currentRepo = computed(() => {
  if (!route.params.repo || Array.isArray(route.params.repo)) {
    return DEFAULT_REPO_NAME
  }
  return route.params.repo
})
</script>
