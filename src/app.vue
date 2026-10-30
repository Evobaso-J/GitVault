<template>
  <UApp>
    <div class="h-screen">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
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
  transform: translateY(20px);
}
.page-enter-to, .page-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
