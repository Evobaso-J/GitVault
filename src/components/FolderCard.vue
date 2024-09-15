<template>
  <ULink
    :to
  >
    <UCard
      :ui="{
        // UCard Config: https://ui.nuxt.com/components/card#config
        background: 'hover:bg-gray-100 dark:hover:bg-gray-800',
        body: {
          padding: 'px-4 py-3 sm:px-4 sm:py-3',
        },
      }"
    >
      <span class="flex items-center gap-3">
        <span>
          <UIcon
            name="i-material-symbols-folder"
            class="w-6 h-6 text-gray-500"
          />
        </span>
        <span class="text-sm truncate">
          {{ title }}
        </span>
      </span>
    </UCard>
  </ULink>
</template>

<script setup lang='ts'>
import type { NuxtLinkProps } from '#app'

defineComponent({ name: 'FolderCard' })
type FolderCardProps = {
  title: string
  to: NuxtLinkProps['to']
}

defineProps<FolderCardProps>()
</script>
