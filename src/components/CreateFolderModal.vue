<template>
  <CreateNamedResourceModal
    v-model="model"
    :title="$t('createFolder')"
    :schema="createFolderSchema"
    :initial-state="{ name: '' }"
    @submit="saveAndClose"
    @cancel="model = false"
  />
</template>

<script setup lang='ts'>
import { z } from 'zod'

defineComponent({ name: 'CreateFolderModal' })

const model = defineModel<boolean>()

const { t } = useI18n()

const createFolderSchema = z.object({
  name: z.string().min(1).refine(name => !name.includes('/'), {
    message: t('validationError.noSlashInFolderName'),
  }),
})

const { createFolder } = useVaultContents()
const saveAndClose = async (name: string) => {
  await createFolder(name)
  model.value = false
}
</script>
