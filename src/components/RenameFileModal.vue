<template>
  <CreateNamedResourceModal
    :model-value="true"
    :title="$t('renameFile')"
    :schema="renameSchema"
    :initial-state="{ name: baseName }"
    :submit-label="$t('rename')"
    @submit="newBaseName => emit('close', newBaseName + extension)"
    @cancel="emit('close')"
    @update:model-value="open => !open && emit('close')"
  >
    <template #input="{ state }">
      <UFormField name="name">
        <UInput
          v-model="state.name"
          autofocus
          class="w-full"
        >
          <!-- The extension is locked: a different one would break the preview -->
          <template
            v-if="extension"
            #trailing
          >
            <span class="text-sm text-muted">{{ extension }}</span>
          </template>
        </UInput>
      </UFormField>
    </template>
  </CreateNamedResourceModal>
</template>

<script setup lang='ts'>
import { z } from 'zod'
import { getLockedExtension, isFileNameValid } from '~/resources/CDNFiles/constants'

defineComponent({ name: 'RenameFileModal' })
// useOverlay passes `open`; CreateNamedResourceModal is always open while mounted
defineOptions({ inheritAttrs: false })
const props = defineProps<{ name: string }>()
const emit = defineEmits<{ close: [name?: string] }>()

const { t } = useI18n()

const extension = getLockedExtension(props.name)
const baseName = props.name.slice(0, props.name.length - extension.length)

const renameSchema = z.object({
  name: z.string().trim().refine(isFileNameValid, { message: t('validationError.invalidFileName') }),
})
</script>
