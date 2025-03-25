<template>
  <span class="text-5xl font-semibold">{{ $t('noRepos.step3.title') }}</span>
  <i18n-t
    tag="span"
    keypath="noRepos.step3.description"
    class="text-lg"
  >
    <template #repoName>
      <span class="font-semibold text-primary px-2 py-1 rounded-md bg-royal-blue-100">{{ repoName }}</span>
    </template>
  </i18n-t>
  <UButton
    variant="outline"
    size="xl"
    :to="`/${repoName}`"
  >
    {{ $t('noRepos.step3.cta') }}
  </UButton>
</template>

<script setup lang='ts'>
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

defineComponent({ name: 'NoReposSetupWizardStep3' })

type NoReposSetupWizardStep3Props = {
  repoName: CDNUserRepoName
}

defineProps<NoReposSetupWizardStep3Props>()
</script>
