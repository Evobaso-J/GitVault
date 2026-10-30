<template>
  <ULink
    :to="`/${$route.params.repo}/${to}`"
  >
    <UCard
      class="bg-royal-blue-50 hover:bg-royal-blue-100 dark:bg-royal-blue-950 dark:hover:bg-royal-blue-900 ring-1 ring-primary/20 hover:ring-primary/40"
      :ui="{
        // UCard Theme: https://ui.nuxt.com/docs/components/card#theme
        body: 'px-4 py-3 sm:px-4 sm:py-3',
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
