<template>
  <ULink
    :to
  >
    <UCard
      :ui="{
        // UCard Config: https://ui.nuxt.com/components/card#config
        background: 'bg-royal-blue-50 hover:bg-royal-blue-100 dark:bg-royal-blue-950 dark:hover:bg-royal-blue-900',
        body: {
          padding: 'px-4 py-3 sm:px-4 sm:py-3',
        },
        ring: 'ring-1 ring-primary ring-opacity-20 hover:ring-opacity-40 dark:ring-primary dark:ring-opacity-20 dark:hover:dark:ring-opacity-40',
      }"
    >
      <span class="flex items-center gap-3">
        <UIcon
          name="i-material-symbols-folder"
          class="w-6 h-6 text-primary"
        />
        <span class="text-sm truncate font-semibold">
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
