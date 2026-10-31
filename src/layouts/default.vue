<template>
  <UDashboardGroup>
    <UDashboardSidebar :ui="{ root: 'bg-elevated/50' }">
      <template #header>
        <AppLogo size="28" />
        <span class="font-bold text-lg">{{ $t('app.name') }}</span>
      </template>

      <VaultNavigation />
      <UButton
        :label="$t('phoneBackup.title')"
        icon="i-mdi-cellphone-arrow-down"
        :to="`/${route.params.repo}/backup`"
        color="neutral"
        variant="ghost"
        class="justify-start"
      />

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
            <VaultSearch />
            <template v-if="!isBackupPage">
              <UButton
                :aria-label="$t('newFolder')"
                icon="i-mdi-folder-plus-outline"
                color="neutral"
                variant="ghost"
                class="md:hidden"
                @click="isFolderModalOpen = true"
              />
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
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <CreateFolderModal v-model="isFolderModalOpen" />
    <UploadQueue />
    <UButton
      v-if="!isBackupPage"
      :label="$t('upload')"
      icon="i-mdi-upload-outline"
      size="xl"
      class="fixed bottom-6 right-4 z-40 md:hidden rounded-full px-6 shadow-lg"
      @click="pickAndUpload()"
    />
  </UDashboardGroup>
</template>

<script setup lang='ts'>
import type { BreadcrumbItem } from '@nuxt/ui'
import { getVaultLabel } from '~/config'

const route = useRoute()
// Folder actions write to the current folder, which the backup page doesn't have
const isBackupPage = computed(() => route.name === 'repo-backup')
const links = computed<BreadcrumbItem[]>(() => {
  const repo = String(route.params.repo)
  const linksFromRoute = route.path.split('/')
    .filter(pathSection => !!pathSection && pathSection !== repo)
    .map((path, index, array) => ({
      label: decodeURIComponent(path),
      to: `/${repo}/${array.slice(0, index + 1).join('/')}`,
    }))

  return [{
    label: getVaultLabel(repo),
    icon: 'i-mdi-archive-outline',
    to: `/${repo}`,
  }, ...linksFromRoute]
})

const isFolderModalOpen = ref(false)
const { pickAndUpload } = useVaultContents()
</script>
