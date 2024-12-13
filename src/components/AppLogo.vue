<template>
  <NuxtLink
    to="/"
    class="flex items-center cursor-pointer flex-col justify-center"
  >
    <NuxtImg
      src="/images/logo.png"
      alt="Logo"
      width="40"
    />
    <h1
      class="text-sm font-semibold"
    >
      {{ $t('app.name') }}
    </h1>
  </NuxtLink>
</template>

<script setup lang='ts'>
defineComponent({ name: 'AppLogo' })
</script>
