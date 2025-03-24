<template>
  <UContainer class="h-full flex pt-10 md:pt-44 items-start">
    <NoReposSetupWizard />
  </UContainer>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  middleware: [
    '00-auth',
    '04-no-active-repo',
  ],
  layout: 'no-repo',
})
useHead({
  title: t('noRepos.title'),
})
</script>
