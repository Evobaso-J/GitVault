<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden">
    CIAO
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: ['00-auth', '04-no-active-repo'],
  layout: false,
})
useHead({
  title: t('noRepos.title'),
})
</script>
