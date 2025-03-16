<template>
  <UContainer class="mt-28">
    <transition
      name="slide"
      mode="out-in"
    >
      <section
        :key="currentStep"
        class="flex flex-col justify-center gap-8 h-full w-1/2"
      >
        <NoReposSetupStep1
          v-if="currentStep === 0"
          @next-step="goToNextStep"
        />
        <NoReposSetupStep2
          v-if="currentStep === 1"
          @create-repo="createRepo"
        />
        <NoReposSetupStep3
          v-if="currentStep === 2 && repoName"
          :repo-name="repoName"
          @next-step="navigateTo(repoName)"
        />
      </section>
    </transition>
  </UContainer>
</template>

<script setup lang="ts">
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'
import { sleep } from '~/utils'

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

const goToNextStep = () => {
  currentStep.value++
}

const { createUserRepo } = useCreateUserRepo()

const repoName = ref<CDNUserRepoName>()
const createRepo = async (name: CDNUserRepoName) => {
  await createUserRepo({ name })
  repoName.value = name
  goToNextStep()
}

// Starting out of range to trigger the transition on the first element
const currentStep = ref<number>(-1)
onMounted(async () => {
  await sleep(200)
  currentStep.value = 0
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.slide-enter-to, .slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
