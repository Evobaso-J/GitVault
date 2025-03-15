<template>
  <UContainer class="mt-28">
    <transition
      name="slide"
      mode="out-in"
    >
      <section
        v-if="steps[currentStep]"
        :key="currentStep"
        class="flex flex-col justify-center gap-8 h-full w-1/2"
      >
        <span class="text-5xl font-semibold">{{ steps[currentStep]!.title }}</span>
        <span class="text-lg">{{ steps[currentStep]!.description }}</span>
        <UButton
          variant="outline"
          class="mr-auto"
          size="xl"
          @click="steps[currentStep]!.onClick"
        >
          {{ steps[currentStep]!.cta }}
        </UButton>
      </section>
    </transition>
  </UContainer>
</template>

<script setup lang="ts">
import { GITVAULT_REPO_PREFIX } from '~/config'
import { sleep } from '~/utils'

const { t } = useI18n()

definePageMeta({
  middleware: [
    '00-auth',
    //  '04-no-active-repo'
  ],
  layout: 'no-repo',
})
useHead({
  title: t('noRepos.title'),
})

const steps = [{
  title: t('noRepos.step1.title'),
  description: t('noRepos.step1.description'),
  cta: t('noRepos.step1.cta'),
  onClick: () => currentStep.value++,
},
{
  title: t('noRepos.step2.title'),
  description: t('noRepos.step2.description', { repoPrefix: GITVAULT_REPO_PREFIX }),
  cta: t('noRepos.step2.cta'),
  onClick: () => currentStep.value++,
},
{
  title: t('noRepos.step3.title'),
  description: t('noRepos.step3.description'),
  cta: t('noRepos.step3.cta'),
}]

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
