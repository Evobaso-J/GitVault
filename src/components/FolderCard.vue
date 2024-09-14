<template>
  <ULink
    :to
  >
    <UCard
      :ui="{
        // UCard Config: https://ui.nuxt.com/components/card#config
        body: {
          padding: 'px-4 py-3 sm:px-4 sm:py-3',
        },
      }"
    >
      <span class="flex items-center gap-3 text-sm">
        <UIcon
          name="i-material-symbols-folder"
          class="w-6 h-6"
        />
        {{ title }}
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
