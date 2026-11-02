<template>
  <div class="flex flex-col gap-1">
    <span class="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
      {{ $t('vaults') }}
    </span>
    <UNavigationMenu
      :items="items"
      orientation="vertical"
      :aria-label="$t('vaults')"
    />
    <UButton
      :label="$t('newVault')"
      icon="i-mdi-plus"
      variant="ghost"
      class="justify-start"
      @click="isModalOpen = true"
    />
    <UButton
      v-if="route.params.repo"
      :label="$t('deleteVault.action')"
      icon="i-mdi-trash-can-outline"
      color="error"
      variant="ghost"
      class="justify-start"
      @click="deleteUserRepo(String(route.params.repo))"
    />
    <CreateNamedResourceModal
      v-model="isModalOpen"
      :title="$t('createRepo')"
      :schema="USER_REPO_SCHEMA"
      :initial-state="USER_REPO_FORM_INITIAL_STATE"
      @submit="saveAndClose"
      @cancel="isModalOpen = false"
    >
      <template #input="{ state }">
        <UFormField name="name">
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>
      </template>
    </CreateNamedResourceModal>
  </div>
</template>

<script setup lang='ts'>
import type { NavigationMenuItem } from '@nuxt/ui'
import { USER_REPO_FORM_INITIAL_STATE, USER_REPO_SCHEMA } from '~/resources/CDNUserRepos/constants'

defineComponent({ name: 'VaultNavigation' })

const route = useRoute()
const { repositoryNames } = useRepoStorage()

const items = computed<NavigationMenuItem[]>(() => repositoryNames.value.map(name => ({
  label: name,
  icon: 'i-mdi-archive-outline',
  to: `/${name}`,
  // The vault stays active on every folder below its root
  active: name === route.params.repo,
})))

const isModalOpen = ref(false)
const { createUserRepo } = useCreateUserRepo()
// Close first: the toast reports progress and errors, the request can take seconds
const saveAndClose = (name: string) => {
  isModalOpen.value = false
  createUserRepo({ name })
}

// Acts on the open vault, like the phone backup link
const { deleteUserRepo } = useDeleteUserRepo()
</script>
