<template>
  <div class="flex flex-col gap-1">
    <span class="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
      {{ $t('vaults') }}
    </span>
    <div
      v-if="fetchStatus === 'pending' && !items.length"
      aria-busy="true"
      class="flex flex-col"
    >
      <div
        v-for="width in ['60%', '45%']"
        :key="width"
        class="flex items-center gap-1.5 px-2.5 py-1.5"
      >
        <USkeleton class="size-5 shrink-0" />
        <USkeleton
          class="h-3"
          :style="{ width }"
        />
      </div>
    </div>
    <UNavigationMenu
      v-else
      :items="items"
      orientation="vertical"
      :aria-label="$t('vaults')"
    />
    <p
      v-if="isOpenVaultFull"
      class="px-2.5 py-1 text-xs text-warning"
    >
      {{ $t('vaultFull', { size: formatBytes(VAULT_FULL_BYTES) }) }}
    </p>
    <UButton
      :label="$t('newVault')"
      icon="i-mdi-plus"
      variant="ghost"
      class="justify-start"
      @click="isModalOpen = true"
    />
    <!-- A disabled button gets no pointer events: the tooltip hangs on the wrapper -->
    <UTooltip
      v-if="route.params.repo"
      :text="$t('deleteVault.lastVault')"
      :disabled="!isLastVault"
    >
      <div class="flex flex-col">
        <UButton
          :label="$t('deleteVault.action')"
          icon="i-mdi-trash-can-outline"
          color="error"
          variant="ghost"
          class="justify-start"
          :disabled="isLastVault"
          @click="deleteUserRepo(String(route.params.repo))"
        />
      </div>
    </UTooltip>
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
import { VAULT_FULL_BYTES } from '~/config'

defineComponent({ name: 'VaultNavigation' })

const route = useRoute()
const { repositoryNames, repositorySizes, fetchStatus } = useRepoStorage()

const isFull = (name: string) => (repositorySizes.value.get(name) ?? 0) >= VAULT_FULL_BYTES

const items = computed<NavigationMenuItem[]>(() => repositoryNames.value.map(name => ({
  label: name,
  icon: 'i-mdi-archive-outline',
  to: `/vaults/${name}`,
  // The vault stays active on every folder below its root
  active: name === route.params.repo,
  badge: {
    // GitHub's figure is approximate and lags behind recent uploads
    label: `~${formatBytes(repositorySizes.value.get(name) ?? 0)}`,
    color: isFull(name) ? 'warning' : 'neutral',
    variant: 'subtle',
  },
})))

const isOpenVaultFull = computed(() => !!route.params.repo && isFull(String(route.params.repo)))

const isModalOpen = ref(false)
const { createUserRepo } = useCreateUserRepo()
// Close first: the toast reports progress and errors, the request can take seconds
const saveAndClose = (name: string) => {
  isModalOpen.value = false
  createUserRepo({ name })
}

// Acts on the open vault, like the phone backup link
const { deleteUserRepo } = useDeleteUserRepo()
// The server refuses it too: the app always needs a vault
const isLastVault = computed(() => repositoryNames.value.length <= 1)
</script>
