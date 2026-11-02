<template>
  <UModal
    :title="$t('deleteVault.title')"
    :description="$t('deleteVault.description', { name })"
    :close="false"
    @update:open="open => !open && emit('close', false)"
  >
    <template #body>
      <UFormField :label="$t('deleteVault.confirmLabel', { name })">
        <UInput
          v-model="typedName"
          autocomplete="off"
          class="w-full"
        />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton
          :label="$t('cancel')"
          color="neutral"
          variant="outline"
          @click="emit('close', false)"
        />
        <UButton
          :label="$t('deleteVault.action')"
          icon="i-mdi-trash-can-outline"
          color="error"
          :disabled="typedName !== name"
          @click="emit('close', true)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang='ts'>
defineComponent({ name: 'ConfirmDeleteVaultModal' })
defineProps<{ name: string }>()
const emit = defineEmits<{ close: [confirmed: boolean] }>()

// Deleting a vault can't be undone: the button waits for the exact name, like GitHub
const typedName = ref('')
</script>
