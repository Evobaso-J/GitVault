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
      <FileCardHeader
        :title
      />
    </UCard>
  </ULink>
</template>

<script setup lang='ts'>
import type { NuxtLinkProps } from '#app'

defineComponent({ name: 'FileCard' })
export type FileCardProps = {
  title: string
  to: NuxtLinkProps['to']
}

defineProps<FileCardProps>()
</script>
