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
    <CreateNamedResourceModal
      v-model="isModalOpen"
      :title="$t('createRepo')"
      :schema="USER_REPO_SCHEMA"
      :initial-state="USER_REPO_FORM_INITIAL_STATE"
      @submit="saveAndClose"
      @cancel="isModalOpen = false"
    >
      <template #input="{ state }">
        <div class="flex items-start gap-1">
          <span
            class="font-semibold text-lg text-primary px-2 py-1 rounded-md bg-primary/10 h-8 flex items-center"
          >{{ GITVAULT_REPO_PREFIX }}</span>
          <UFormField
            name="name"
            class="w-full"
          >
            <UInput v-model="state.name" />
          </UFormField>
        </div>
      </template>
    </CreateNamedResourceModal>
  </div>
</template>

<script setup lang='ts'>
import type { NavigationMenuItem } from '@nuxt/ui'
import { GITVAULT_REPO_PREFIX } from '~/config'
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
const saveAndClose = async (name: string) => {
  await createUserRepo({ name: `${GITVAULT_REPO_PREFIX}${name}` })
  isModalOpen.value = false
}
</script>
