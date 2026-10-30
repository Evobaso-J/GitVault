<template>
  <div class="flex justify-center pt-10 md:pt-24">
    <UForm
      v-if="status === 'success' && !hasVaults"
      :schema="USER_REPO_SCHEMA"
      :state="formState"
      class="w-full max-w-md flex flex-col gap-6"
      @submit="createFirstVault"
    >
      <div class="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
        <UIcon
          name="i-mdi-archive-outline"
          class="size-7 text-primary"
        />
      </div>
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('firstVault.title') }}
        </h1>
        <p class="text-muted">
          {{ $t('firstVault.description') }}
        </p>
      </div>
      <UFormField
        name="name"
        :label="$t('name')"
        :help="$t('firstVault.help', { repo: `${user?.login}/${GITVAULT_REPO_PREFIX}${formState.name}` })"
      >
        <UInput
          v-model="formState.name"
          size="xl"
          class="w-full"
          :ui="{ base: 'ps-[4.6rem]', leading: 'pointer-events-none' }"
        >
          <template #leading>
            <span class="text-muted">{{ GITVAULT_REPO_PREFIX }}</span>
          </template>
        </UInput>
      </UFormField>
      <UButton
        type="submit"
        :label="$t('firstVault.cta')"
        :loading="isCreating"
        size="xl"
        block
      />
    </UForm>

    <section
      v-else-if="status === 'success'"
      class="w-full max-w-md flex flex-col gap-6"
    >
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ $t('selectRepo.title') }}
        </h1>
        <p class="text-muted">
          {{ $t('selectRepo.description') }}
        </p>
      </div>
      <USelectMenu
        v-model="selectedRepo"
        :placeholder="$t('selectRepo.cta')"
        :items="repositoryNames"
        size="xl"
      />
      <UButton
        :disabled="!selectedRepo"
        :to="selectedRepo && `/${selectedRepo}`"
        :label="selectedRepo ? $t('selectRepo.goToRepo', { selectedRepo }) : $t('selectRepo.cta')"
        size="xl"
        block
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core'
import { GITVAULT_REPO_PREFIX } from '~/config'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'
import { USER_REPO_SCHEMA, type UserRepoForm } from '~/resources/CDNUserRepos/constants'

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

const { user } = useUserSession()
const { isAnyRepoPresent, repositoryNames, fetchStatus } = useRepoStorage()

// Decided once: creating the first vault must not swap the form for the vault picker
const status = ref<'pending' | 'success'>('pending')
const hasVaults = ref(false)
until(fetchStatus).toBe('success').then(() => {
  hasVaults.value = isAnyRepoPresent.value
  status.value = 'success'
})

const formState = ref<UserRepoForm>({ name: 'personal' })
const isCreating = ref(false)
const { createUserRepo } = useCreateUserRepo()

// UForm emits `submit` only after the schema validation passes
const createFirstVault = async () => {
  const name: CDNUserRepoName = `${GITVAULT_REPO_PREFIX}${formState.value.name}`
  isCreating.value = true
  const result = await createUserRepo({ name })
  isCreating.value = false
  if (result === 'success') await navigateTo(`/${name}`)
}

const selectedRepo = ref<CDNUserRepoName>()
</script>
