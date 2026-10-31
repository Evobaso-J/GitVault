<template>
  <div class="flex justify-center pt-10 md:pt-24">
    <section
      v-if="status === 'success' && !hasVaults"
      class="w-full max-w-md flex flex-col items-center gap-4 text-center"
    >
      <div class="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
        <UIcon
          :name="isCreating ? 'i-mdi-loading' : 'i-mdi-archive-outline'"
          class="size-7 text-primary"
          :class="{ 'animate-spin': isCreating }"
        />
      </div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ $t('firstVault.title') }}
      </h1>
      <p class="text-muted">
        {{ isCreating ? $t('firstVault.creating') : $t('firstVault.error') }}
      </p>
      <UButton
        v-if="!isCreating"
        :label="$t('retry')"
        size="xl"
        @click="createFirstVault"
      />
    </section>

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
        :items="vaultItems"
        value-key="value"
        size="xl"
      />
      <UButton
        :disabled="!selectedRepo"
        :to="selectedRepo && `/${selectedRepo}`"
        :label="selectedRepo ? $t('selectRepo.goToRepo', { selectedRepo: getVaultLabel(selectedRepo) }) : $t('selectRepo.cta')"
        size="xl"
        block
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core'
import { GITVAULT_REPO_PREFIX, getVaultLabel } from '~/config'
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

const isCreating = ref(false)
const { createUserRepo } = useCreateUserRepo()

// New users never pick a name: the first vault is created for them
const createFirstVault = async () => {
  const name: CDNUserRepoName = `${GITVAULT_REPO_PREFIX}personal`
  isCreating.value = true
  const result = await createUserRepo({ name })
  isCreating.value = false
  if (result === 'success') await navigateTo(`/${name}`)
}

// Decided once: creating the first vault must not swap this screen for the vault picker
const status = ref<'pending' | 'success'>('pending')
const hasVaults = ref(false)
until(fetchStatus).toBe('success').then(() => {
  hasVaults.value = isAnyRepoPresent.value
  status.value = 'success'
  if (!hasVaults.value) createFirstVault()
})

const selectedRepo = ref<CDNUserRepoName>()
const vaultItems = computed(() => repositoryNames.value.map(name => ({ label: getVaultLabel(name), value: name })))
</script>
