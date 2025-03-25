<template>
  <section
    :key="currentStep"
    class="flex flex-col justify-center gap-8 md:w-1/2 text-center md:text-start items-center md:items-start"
  >
    <!-- :key="currentStep" added for transition -->
    <NoReposSetupWizardStep1
      v-if="currentStep === 0"
      @next-step="goToNextStep"
    />
    <NoReposSetupWizardStep2
      v-if="currentStep === 1"
      @create-repo="createRepo"
    />
    <NoReposSetupWizardStep3
      v-if="currentStep === 2 && repoName"
      :repo-name="repoName"
      @next-step="navigateTo(repoName)"
    />
  </section>
</template>

<script setup lang="ts">
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

defineComponent({
  name: 'NoReposSetupWizard',
})

const goToNextStep = () => {
  currentStep.value++
}

const { createUserRepo } = useCreateUserRepo()

const repoName = ref<CDNUserRepoName>()
const createRepo = async (name: CDNUserRepoName) => {
  const status = await createUserRepo({ name })
  if (status === 'success') {
    repoName.value = name
    goToNextStep()
  }
}

const currentStep = ref<number>(0)
</script>
