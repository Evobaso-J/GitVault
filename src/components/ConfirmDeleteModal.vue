<template>
  <UModal
    :title="$t(folder ? 'deleteFolderTitle' : 'deleteFileTitle')"
    :description="$t(folder ? 'deleteFolderDescription' : 'deleteFileDescription', { name })"
    :close="false"
    @update:open="open => !open && emit('close', false)"
  >
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton
          :label="$t('cancel')"
          color="neutral"
          variant="outline"
          @click="emit('close', false)"
        />
        <UButton
          :label="$t('delete')"
          icon="i-mdi-trash-can-outline"
          color="error"
          @click="emit('close', true)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang='ts'>
defineComponent({ name: 'ConfirmDeleteModal' })
defineProps<{ name: string, folder?: boolean }>()
const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>
