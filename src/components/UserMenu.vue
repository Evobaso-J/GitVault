<template>
  <UDropdownMenu
    v-if="user"
    :items="items"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :label="user?.login"
      :avatar="{ src: `https://github.com/${user?.login}.png`, alt: user?.login }"
      trailing-icon="i-mdi-unfold-more-horizontal"
    />
  </UDropdownMenu>
  <UploadKeyModal
    v-if="repo"
    v-model="isUploadKeyOpen"
    :repo="repo"
  />
</template>

<script setup lang='ts'>
import type { DropdownMenuItem } from '@nuxt/ui'

defineComponent({ name: 'UserMenu' })

const { user, clear } = useUserSession()
const { t } = useI18n()
const route = useRoute()

const repo = computed(() => typeof route.params.repo === 'string' ? route.params.repo : undefined)
const isUploadKeyOpen = ref(false)

const items = computed(() => [
  repo.value
    ? [{
        label: t('uploadKey.menu'),
        icon: 'i-mdi-cellphone-arrow-down',
        onSelect: () => {
          isUploadKeyOpen.value = true
        },
      }]
    : [],
  [
    {
      label: t('logout'),
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: async () => {
        await clear()
        navigateTo('/login')
      },
    },
  ],
] satisfies DropdownMenuItem[][])
</script>
