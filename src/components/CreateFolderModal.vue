<template>
  <UModal v-model="model">
    <UCard>
      <template #header>
        {{ $t('createFolder') }}
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="save"
      >
        <UFormGroup name="name">
          <UInput v-model="state.name" />
        </UFormGroup>

        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            @click="$emit('cancel')"
          >
            {{ $t('cancel') }}
          </UButton>
          <UButton
            type="submit"
            variant="outline"
          >
            {{ $t('create') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang='ts'>
import { z } from 'zod'

defineComponent({ name: 'CreateFolderModal' })

const model = defineModel<boolean>()

const { t } = useI18n()
const schema = z.object({
  name: z.string().min(1).refine(name => !name.includes('/'), {
    message: t('validationError.noSlashInFolderName'),
  }),
})

const state = reactive({
  name: '',
})

type CreateFolderModalEmits = {
  (e: 'create-folder', name: string): void
  (e: 'cancel'): void
}
const emit = defineEmits<CreateFolderModalEmits>()

const { createFolder } = useCreateFolder()

const save = async () => {
  emit('create-folder', state.name)
  await createFolder(state.name)
  state.name = ''
}
</script>
