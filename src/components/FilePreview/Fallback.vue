<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-lg bg-elevated p-6 text-center">
    <UIcon
      :name="getIconFromFileName(source.name)"
      class="size-12 text-muted"
    />
    <span class="text-sm text-muted">{{ $t('filePreview.fallback.title') }}</span>
    <UButton
      :label="$t('showAsText')"
      icon="i-mdi-text"
      color="neutral"
      variant="outline"
      size="sm"
      @click="isModalOpen = true"
    />
    <UModal
      v-model:open="isModalOpen"
      :title="source.name"
    >
      <template #body>
        <FilePreviewText
          :source="source"
          class="max-h-[60vh]"
        />
      </template>
    </UModal>
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'
import { getIconFromFileName } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FallbackFilePreview' })
defineProps<FilePreviewProps>()

const isModalOpen = ref(false)
</script>
