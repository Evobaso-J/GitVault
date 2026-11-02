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
import { isFileNameValid } from '~/resources/CDNFiles/constants'

defineComponent({ name: 'CreateFolderModal' })

const model = defineModel<boolean>()

const { t } = useI18n()

const createFolderSchema = z.object({
  name: z.string().trim().refine(isFileNameValid, { message: t('validationError.invalidFileName') }),
})

const { createFolder } = useVaultContents()
const saveAndClose = (name: string) => {
  model.value = false
  createFolder(name)
}
</script>
