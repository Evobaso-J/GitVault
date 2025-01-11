<template>
  <NuxtLink
    to="/"
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
defineComponent({ name: 'AppLogo' })
</script>
