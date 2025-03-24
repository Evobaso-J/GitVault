<template>
  <UContainer class="h-full flex pt-10 md:pt-44 items-start">
    <transition
      name="slide"
      mode="out-in"
    >
      <NoReposSetupWizard v-if="!isAnyRepoPresent && fetchStatus !== 'pending'" />
      <section
        v-else-if="isAnyRepoPresent && fetchStatus !== 'pending'"
        key="select-repo"
        class="flex flex-col justify-center gap-8 md:w-1/2 text-center md:text-start items-center md:items-start"
      >
        <span class="text-5xl font-semibold">{{ $t('selectRepo.title') }}</span>
        <span class="text-lg">{{ $t('selectRepo.description') }}</span>
        <USelectMenu
          v-model="selectedRepo"
          class="w-full"
          :placeholder="$t('selectRepo.cta')"
          searchable
          :options="repositoryNames"
          size="xl"
        />
        <transition
          name="slide"
          mode="out-in"
        >
          <span v-if="selectedRepo">
            <!-- Span is needed to make animation work -->
            <UButton
              variant="outline"
              size="xl"
              :to="`/${selectedRepo}`"
            >
              {{ $t('selectRepo.goToRepo', { selectedRepo }) }}
            </UButton>
          </span>
        </transition>
      </section>
    </transition>
  </UContainer>
</template>

<script setup lang="ts">
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

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

const { isAnyRepoPresent, repositoryNames, fetchStatus } = useRepoStorage()
const selectedRepo = ref<CDNUserRepoName>()
</script>

<style scoped>
@import url('~/assets/animations.css');
</style>
