<template>
  <UModal
    v-model:open="model"
    :title="title"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="save"
      >
        <slot
          name="input"
          :state="state"
        >
          <UFormField name="name">
            <UInput v-model="state.name" />
          </UFormField>
        </slot>

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
    </template>
  </UModal>
</template>

<script setup lang='ts'>
import type { z } from 'zod'

defineComponent({ name: 'CreateNamedResourceModal' })

const model = defineModel<boolean>()

type CreateNamedResourceModalEmits = {
  (e: 'submit', name: string): void
  (e: 'cancel'): void
}
const emit = defineEmits<CreateNamedResourceModalEmits>()

type CreateNamedResourceModalProps = {
  title: string
  schema: z.ZodObject<{ name: z.ZodEffects<z.ZodString> | z.ZodString }>
  initialState: { name: string }
}
const props = defineProps<CreateNamedResourceModalProps>()

const state = reactive(props.initialState)

const save = async () => {
  emit('submit', state.name)
  state.name = ''
}
</script>
