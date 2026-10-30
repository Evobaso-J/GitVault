<template>
  <UEmpty
    role="alert"
    :avatar="{ icon: 'i-mdi-alert-outline', class: 'bg-error/10 rounded-xl', ui: { icon: 'text-error' } }"
    :title="$t(notFound ? 'folderError.notFoundTitle' : 'folderError.title')"
    :description="$t(notFound ? 'folderError.notFoundDescription' : 'folderError.description')"
    :actions="[
      { label: $t('retry'), icon: 'i-mdi-refresh', onClick: () => emit('retry') },
      ...(parent ? [{ label: $t('backTo', { folder: parent.name }), color: 'neutral' as const, variant: 'outline' as const, to: parent.to }] : []),
    ]"
    variant="outline"
    size="xl"
    class="min-h-96"
  >
    <template
      v-if="error.statusCode"
      #footer
    >
      <span class="font-mono text-xs text-muted">{{ error.statusCode }} · {{ error.statusMessage }}</span>
    </template>
  </UEmpty>
</template>

<script setup lang='ts'>
import type { NuxtError } from '#app'

defineComponent({ name: 'FolderContentsError' })
type FolderContentsErrorProps = {
  error: Pick<NuxtError, 'statusCode' | 'statusMessage'>
  /** Folder to go back to; none at the vault root */
  parent?: { name: string, to: string }
}
const props = defineProps<FolderContentsErrorProps>()
const emit = defineEmits<{ retry: [] }>()

const notFound = computed(() => props.error.statusCode === 404)
</script>
