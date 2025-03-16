<template>
  <UDropdown
    v-if="user"
    :items="items"
  >
    <UAvatar
      :src="`https://github.com/${user.login}.png`"
      :alt="user.login"
      size="lg"
    />
  </UDropdown>
</template>

<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'

defineComponent({ name: 'UserMenu' })

const { user, clear } = useUserSession()

const items = [
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: async () => {
        await clear()
        navigateTo('/login')
      },
    },
  ],
] satisfies DropdownItem[][]
</script>
