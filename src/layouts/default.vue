<template>
  <UDashboardGroup>
    <UDashboardSidebar :ui="{ root: 'bg-elevated/50' }">
      <template #header>
        <AppLogo size="28" />
        <span class="font-bold text-lg">{{ $t('app.name') }}</span>
      </template>

      <VaultNavigation />

      <template #footer>
        <UserMenu />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar>
          <template #title>
            <UBreadcrumb :items="links" />
          </template>
          <template #right>
            <SearchBar class="hidden sm:block w-72" />
            <div class="hidden md:flex items-center gap-2">
              <UButton
                :label="$t('newFolder')"
                icon="i-mdi-folder-plus-outline"
                color="neutral"
                variant="outline"
                @click="isFolderModalOpen = true"
              />
              <UButton
                :label="$t('uploadFile')"
                icon="i-mdi-upload-outline"
                @click="pickAndUpload()"
              />
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <SearchBar class="sm:hidden" />
        <slot />
      </template>
    </UDashboardPanel>

    <CreateFolderModal v-model="isFolderModalOpen" />
    <UploadQueue />
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
  </UDashboardGroup>
</template>

<script setup lang='ts'>
import type { BreadcrumbItem } from '@nuxt/ui'

const route = useRoute()
const links = computed<BreadcrumbItem[]>(() => {
  const repo = String(route.params.repo)
  const linksFromRoute = route.path.split('/')
    .filter(pathSection => !!pathSection && pathSection !== repo)
    .map((path, index, array) => ({
      label: decodeURIComponent(path),
      to: `/${repo}/${array.slice(0, index + 1).join('/')}`,
    }))

  return [{
    label: repo,
    icon: 'i-mdi-archive-outline',
    to: `/${repo}`,
  }, ...linksFromRoute]
})

const isFolderModalOpen = ref(false)
const { pickAndUpload } = useVaultContents()
</script>
