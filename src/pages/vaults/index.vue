<template>
  <div class="flex justify-center pt-10 md:pt-24">
    <section
      v-if="status === 'success'"
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
      v-else
      aria-busy="true"
      class="w-full max-w-md flex flex-col gap-6"
    >
      <div class="flex flex-col gap-2">
        <USkeleton class="h-8 w-2/3" />
        <USkeleton class="h-4 w-full" />
      </div>
      <USkeleton class="h-11 w-full" />
      <USkeleton class="h-11 w-full" />
      <span
        role="status"
        class="sr-only"
      >{{ $t('loading') }}</span>
    </section>
  </div>
</template>

<script setup lang="ts">
import { until } from '@vueuse/core'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

const { t } = useI18n()

definePageMeta({
  middleware: ['00-auth'],
  layout: 'no-repo',
})
useHead({
  title: t('noRepos.title'),
})

const { lastOpenedRepository, repositoryNames, fetchStatus } = useRepoStorage()

const isCreating = ref(false)
const { createUserRepo } = useCreateUserRepo()

// New users never pick a name: the first vault is created for them
const createFirstVault = async () => {
  const name: CDNUserRepoName = 'personal'
  isCreating.value = true
  await createUserRepo({ name })
  isCreating.value = false
}

// Opens the last opened vault, or the first one if it's gone (or none was opened in this browser)
const status = ref<'pending' | 'success'>('pending')
until(fetchStatus).toBe('success').then(() => {
  const names = repositoryNames.value
  const target = names.find(name => name === lastOpenedRepository.value) ?? names[0]
  if (target) return navigateTo(`/vaults/${target}`, { replace: true })
  status.value = 'success'
  createFirstVault()
})
</script>
