<template>
  <div class="flex flex-col h-screen">
    <AppToolbar class="w-full" />
    <div>
      <UContainer>
        <div class="flex gap-12 md:mt-6 py-3 items-center justify-between border-y dark:border-gray-700 px-2 -mx-2 overflow-x-auto">
          <div class="flex items-center gap-2">
            <UBreadcrumb
              :items="links"
            />
            <CreateItemsDropdown
              :content="{ align: 'start' }"
            >
              <template #activator>
                <UButton
                  class="rounded-lg"
                  variant="soft"
                  size="xs"
                  icon="i-mdi-plus"
                />
              </template>
            </CreateItemsDropdown>
          </div>
          <RepoSelector
            @create-click="openCreateRepoModal"
          />
          <CreateNamedResourceModal
            v-model="isModalOpen"
            :title="$t('createRepo')"
            :schema="USER_REPO_SCHEMA"
            :initial-state="USER_REPO_FORM_INITIAL_STATE"
            @submit="saveAndClose"
            @cancel="closeModal"
          >
            <template #input="{ state }">
              <div class="flex items-start gap-1">
                <span
                  class="font-semibold text-lg text-primary px-2 py-1 rounded-md bg-royal-blue-100 h-8 flex items-center"
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
      </UContainer>
    </div>
    <UContainer class="flex-1 overflow-auto w-full">
      <div class="mb-12 pt-6">
        <slot />
      </div>
    </UContainer>
    <CreateItemsDropdown
      class="fixed bottom-6 right-6 md:hidden"
      :content="{ side: 'top', align: 'end' }"
    >
      <template #activator>
        <UButton
          icon="i-mdi-plus"
          :label="$t('add')"
          size="xl"
        />
      </template>
    </CreateItemsDropdown>
  </div>
</template>

<script setup lang='ts'>
import type { BreadcrumbItem } from '@nuxt/ui'
import { GITVAULT_REPO_PREFIX } from '~/config'
import { USER_REPO_FORM_INITIAL_STATE, USER_REPO_SCHEMA } from '~/resources/CDNUserRepos/constants'

const { t } = useI18n()
const route = useRoute()
const links = computed<BreadcrumbItem[]>(() => {
  const linksFromRoute = route.path.split('/')
    .filter(pathSection => !!pathSection && pathSection !== route.params.repo)
    .map((path, index, array) => ({
      label: decodeURIComponent(path),
      to: `/${route.params.repo}/${array.slice(0, index + 1).join('/')}`,
    }))

  return [{
    label: t('home'),
    to: `/${route.params.repo}`,
  }, ...linksFromRoute]
})
const isModalOpen = ref(false)
const openCreateRepoModal = () => isModalOpen.value = true
const closeModal = () => isModalOpen.value = false

const { createUserRepo } = useCreateUserRepo()
const saveAndClose = async (name: string) => {
  await createUserRepo({ name: `${GITVAULT_REPO_PREFIX}${name}` })
  closeModal()
}
</script>
