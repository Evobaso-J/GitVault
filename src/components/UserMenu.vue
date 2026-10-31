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
</template>

<script setup lang='ts'>
import type { DropdownMenuItem } from '@nuxt/ui'

defineComponent({ name: 'UserMenu' })

const { user, clear } = useUserSession()
const { t } = useI18n()

const items = [
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
] satisfies DropdownMenuItem[][]
</script>
