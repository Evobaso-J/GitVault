<template>
  <div class="flex justify-center items-center">
    <EmptySectionCard
      :title="$t('filePreview.fallback.title')"
      :description="$t('filePreview.fallback.description')"
      icon="i-mdi-file-document-remove-outline"
    >
      <div
        class="flex flex-col gap-4 justify-center items-center w-full"
      >
        <UButton
          v-for="{ label, icon, action } in buttons"
          :key="label"
          block
          :icon="icon"
          variant="outline"
          size="xl"
          :label="label"
          @click="action"
        />
        <UModal
          v-model="isModalOpen"
          :title="source.name"
        >
          <FilePreviewText :source="source" />
        </UModal>
      </div>
    </EmptySectionCard>
  </div>
</template>

<script setup lang='ts'>
import type { FilePreviewProps } from './index.vue'
import { downloadFile } from '~/resources/CDNFiles/utils'

defineComponent({ name: 'FallbackFilePreview' })
type FallbackFilePreviewProps = FilePreviewProps

const props = defineProps<FallbackFilePreviewProps>()

const { t } = useI18n()
const buttons: { icon: string, label: string, action?: () => void }[] = [
  {
    icon: 'i-mdi-github',
    label: t('viewOnGitHub'),
    action: () => {
      if (!props.source.git_url) return
      window.open(props.source._links.html ?? '', '_blank')
    },
  },
  {
    icon: 'i-mdi-download-outline',
    label: t('download'),
    action: () => {
      if (!props.source.download_url) return
      downloadFile(props.source.download_url, props.source.name)
    },
  },
  {
    icon: 'i-mdi-text',
    label: t('showAsText'),
    action: () => isModalOpen.value = true,
  },
]

const isModalOpen = ref(false)
</script>
