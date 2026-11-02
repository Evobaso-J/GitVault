<template>
  <UModal
    v-model:open="model"
    :title="$t('feedback.title')"
    :description="$t('feedback.description')"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="send"
      >
        <UFormField name="message">
          <UTextarea
            v-model="state.message"
            :placeholder="$t('feedback.placeholder')"
            :rows="5"
            autoresize
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="neutral"
            @click="model = false"
          >
            {{ $t('cancel') }}
          </UButton>
          <UButton type="submit">
            {{ $t('feedback.send') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang='ts'>
import { z } from 'zod'

defineComponent({ name: 'FeedbackModal' })

const model = defineModel<boolean>()

const { t } = useI18n()
const schema = z.object({
  message: z.string().trim().min(1, t('feedback.required')).max(5000),
})
const state = reactive({ message: '' })

const { runOperation } = useOperationToast()
const send = async () => {
  model.value = false
  let url = ''
  const status = await runOperation('feedback', async () => {
    ({ url } = await $fetch('/feedback', {
      method: 'POST',
      body: { message: state.message.trim() },
    }))
  }, () => {}, () => ({
    title: t('feedback.sent'),
    // Long enough to reach the button
    duration: 8000,
    actions: [{ label: t('feedback.viewIssue'), icon: 'i-mdi-github', to: url, target: '_blank', color: 'neutral', variant: 'outline' }],
  }))
  // Keep the text on failure so it can be resent
  if (status === 'success') state.message = ''
}
</script>
