<template>
  <UContainer class="my-6">
    <div class="flex items-center gap-6">
      <AppLogo />
      <SearchBar
        class="w-2/3 md:w-1/2"
      />
      <div class="flex-grow" />
      <CreateItemsDropdown
        class="hidden md:block"
        :popper="{ placement: 'auto' }"
      >
        <template #activator>
          <UButton
            icon="i-mdi-plus"
            :label="$t('create')"
            size="xl"
          />
        </template>
      </CreateItemsDropdown>
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
    </div>
  </UContainer>
</template>

<script setup lang='ts'>
import type { DropdownItem } from '#ui/types'

defineComponent({ name: 'AppToolbar' })

const { user, clear } = useUserSession()

const items = [
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: clear,
    },
  ],
] satisfies DropdownItem[][]
</script>
