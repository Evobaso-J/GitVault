<template>
  <UModal
    v-model:open="model"
    :title="$t('uploadKey.title')"
    :description="$t('uploadKey.description', { repo })"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-mdi-alert-outline"
          :title="$t('uploadKey.warningTitle')"
          :description="$t('uploadKey.warning', { repo })"
        />

        <UFormField
          v-if="!key"
          :label="$t('folder')"
          :help="$t('uploadKey.folderHelp', { folder: folder || '/' })"
        >
          <UInput
            v-model="folder"
            class="w-full"
          />
        </UFormField>
        <UButton
          v-if="!key"
          :label="$t('uploadKey.generate')"
          :loading="isGenerating"
          block
          @click="generate"
        />

        <template v-else>
          <UFormField
            :label="$t('uploadKey.keyLabel')"
            :help="$t('uploadKey.shownOnce')"
          >
            <UInput
              :model-value="key"
              readonly
              class="w-full"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  :aria-label="$t('uploadKey.copy')"
                  :icon="copied ? 'i-mdi-check' : 'i-mdi-content-copy'"
                  color="neutral"
                  variant="link"
                  @click="copy(key)"
                />
              </template>
            </UInput>
          </UFormField>
          <ol class="list-decimal ps-5 text-sm text-muted flex flex-col gap-1">
            <li>{{ $t('uploadKey.steps.ios') }}</li>
            <li>{{ $t('uploadKey.steps.android') }}</li>
            <li>{{ $t('uploadKey.steps.request', { url: ingestUrl }) }}</li>
            <li>{{ $t('uploadKey.steps.automation') }}</li>
          </ol>
        </template>
      </div>
    </template>
  </UModal>
</template>

<script setup lang='ts'>
import { useClipboard } from '@vueuse/core'
import type { UploadKeyRequest, UploadKeyResponse } from '~~/server/resources/uploadKey'

defineComponent({ name: 'UploadKeyModal' })

const model = defineModel<boolean>()
const props = defineProps<{ repo: string }>()

const folder = ref('Phone')
const key = ref<string>()
const isGenerating = ref(false)
const { copy, copied } = useClipboard()
const { runOperation } = useOperationToast()
const ingestUrl = new URL('/ingest', useRequestURL()).toString()

const generate = async () => {
  isGenerating.value = true
  await runOperation('upload-key', async () => {
    const body: UploadKeyRequest = { repo: props.repo, folder: folder.value }
    key.value = (await $fetch<UploadKeyResponse>('/upload-key', { method: 'POST', body })).key
  })
  isGenerating.value = false
}

// The key is shown once: closing the modal forgets it
watch(model, (open) => {
  if (!open) key.value = undefined
})
</script>
