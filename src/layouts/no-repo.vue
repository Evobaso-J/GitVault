<template>
  <div class="flex flex-col h-screen">
    <UContainer class="my-6 w-full">
      <div class="flex items-center gap-3 justify-between">
        <AppLogo />
        <div class="text-2xl font-semibold">
          {{ $t('app.name') }}
        </div>
        <div class="flex-grow" />
        <UserMenu />
      </div>
    </UContainer>
    <UContainer class="flex-1 overflow-auto w-full md:mt-6">
      <div class="mb-12 pt-6">
        <slot />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang='ts'>
</script>
