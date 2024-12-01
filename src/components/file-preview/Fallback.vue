<template>
  <div class="flex flex-col gap-4">
    <UAlert
      icon="i-mdi-alert"
      color="yellow"
      variant="subtle"
      :title="source.name"
      :description="$t('file-preview.fallback.description')"
    />
    <UCard
      :ui="{
        background: 'bg-gray-800 dark:bg-gray-800',
        body: {
          base: 'h-full flex flex-col gap-4 justify-center items-center',
        },
      }"
      class="h-[80vh]"
    >
      <div
        class="flex flex-col gap-4 justify-center items-center"
      >
        <UButton
          v-for="{ label, icon, action } in buttons"
          :key="label"
          block
          :icon="icon"
          variant="solid"
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
    </UCard>
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
    icon: 'i-mdi-text',
    label: t('showAsText'),
    action: () => isModalOpen.value = true,
  },
  {
    icon: 'i-mdi-download',
    label: t('download'),
    action: () => {
      if (!props.source.download_url) return
      downloadFile(props.source.download_url, props.source.name)
    },
  },
]

const isModalOpen = ref(false)
</script>
