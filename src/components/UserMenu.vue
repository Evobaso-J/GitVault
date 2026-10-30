<template>
  <UDropdownMenu
    v-if="user"
    :items="items"
  >
    <UButton
      variant="link"
      class="p-0 rounded-full"
      :aria-label="user?.login"
    >
      <UAvatar
        :src="`https://github.com/${user?.login}.png`"
        :alt="user?.login"
        size="lg"
      />
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang='ts'>
import type { DropdownMenuItem } from '@nuxt/ui'

defineComponent({ name: 'UserMenu' })

const { user, clear } = useUserSession()

const items = [
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      onSelect: async () => {
        await clear()
        navigateTo('/login')
      },
    },
  ],
] satisfies DropdownMenuItem[][]
</script>
