<template>
  <CreateNamedResourceModal
    :model-value="true"
    :title="$t('renameFile')"
    :schema="renameSchema"
    :initial-state="{ name }"
    :submit-label="$t('rename')"
    @submit="newName => emit('close', newName)"
    @cancel="emit('close')"
    @update:model-value="open => !open && emit('close')"
  >
    <template #input="{ state }">
      <UFormField name="name">
        <UInput
          v-model="state.name"
          autofocus
          class="w-full"
          @focus.once="selectStem"
        />
      </UFormField>
    </template>
  </CreateNamedResourceModal>
</template>

<script setup lang='ts'>
import { z } from 'zod'
import { isFileNameValid } from '~/resources/CDNFiles/constants'

defineComponent({ name: 'RenameFileModal' })
// useOverlay passes `open`; CreateNamedResourceModal is always open while mounted
defineOptions({ inheritAttrs: false })
const props = defineProps<{ name: string }>()
const emit = defineEmits<{ close: [name?: string] }>()

const { t } = useI18n()

const renameSchema = z.object({
  name: z.string().trim().refine(isFileNameValid, { message: t('validationError.invalidFileName') }),
})

// Select the name without its extension, so typing keeps the file type
const selectStem = (event: FocusEvent) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const dot = props.name.lastIndexOf('.')
  event.target.setSelectionRange(0, dot > 0 ? dot : props.name.length)
}
</script>
