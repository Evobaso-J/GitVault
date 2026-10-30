<template>
  <span class="text-5xl font-semibold">{{ $t('noRepos.step2.title') }}</span>
  <i18n-t
    tag="span"
    keypath="noRepos.step2.description"
    class="text-lg"
  >
    <template #repoPrefix>
      <span class="font-semibold text-primary px-2 py-1 rounded-md bg-royal-blue-100">{{ GITVAULT_REPO_PREFIX }}</span>
    </template>
  </i18n-t>
  <UForm
    :schema="USER_REPO_SCHEMA"
    :state="formState"
    @submit="createRepo"
  >
    <div class="flex items-start gap-1 pb-4 min-h-24">
      <span
        class="font-semibold text-lg text-primary px-2 py-1 rounded-md bg-royal-blue-100 h-8 flex items-center"
      >{{ GITVAULT_REPO_PREFIX }}</span>
      <UFormField
        name="name"
        class="w-full"
      >
        <UInput v-model="formState.name" />
      </UFormField>
    </div>
    <UButton
      type="submit"
      variant="outline"
      size="xl"
    >
      {{ $t('noRepos.step2.cta') }}
    </UButton>
  </UForm>
</template>

<script setup lang='ts'>
import { GITVAULT_REPO_PREFIX } from '~/config'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'
import { USER_REPO_FORM_INITIAL_STATE, USER_REPO_SCHEMA } from '~/resources/CDNUserRepos/constants'

defineComponent({ name: 'NoReposSetupWizardStep2' })

type NoReposSetupWizardStep2Emits = {
  (event: 'create-repo', repoName: CDNUserRepoName): void
}

const emit = defineEmits<NoReposSetupWizardStep2Emits>()

const formState = ref(USER_REPO_FORM_INITIAL_STATE)

// UForm emits `submit` only after the schema validation passes
const createRepo = () => {
  emit('create-repo', `${GITVAULT_REPO_PREFIX}${formState.value.name}`)
}

const resetForm = () => {
  formState.value = USER_REPO_FORM_INITIAL_STATE
}
onMounted(() => {
  resetForm()
})
</script>
