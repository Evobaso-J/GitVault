<template>
  <NuxtLink
    :to="`/${activeRepository}`"
    class="cursor-pointer"
    :class="{ 'pointer-events-none': !activeRepository }"
  >
    <NuxtImg
      src="/images/logo.svg"
      alt="Logo"
      :width="size"
    />
  </NuxtLink>
</template>

<script setup lang='ts'>
defineComponent({ name: 'AppLogo' })

type AppLogoProps = {
  /**
   * The pixel size of the logo.
   */
  size?: string
}

withDefaults(defineProps<AppLogoProps>(), {
  size: '40',
})

const { activeRepository } = useRepoStorage()
</script>
