<template>
  <div class="h-screen">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </div>
</template>

<script setup lang='ts'>
const { t } = useI18n()
useHead({
  titleTemplate: t('app.titleTemplate'),
})
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.page-enter-to, .page-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
