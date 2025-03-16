<template>
  <span class="text-5xl font-semibold">{{ $t('noRepos.step1.title') }}</span>
  <span class="text-lg">{{ $t('noRepos.step1.description') }}</span>
  <UButton
    variant="outline"
    size="xl"
    @click="goToNextStep"
  >
    {{ $t('noRepos.step1.cta') }}
  </UButton>
</template>

<script setup lang='ts'>
defineComponent({ name: 'NoReposSetupStep1' })

type NoReposSetupStep1Emits = {
  (event: 'next-step'): void
}

const emit = defineEmits<NoReposSetupStep1Emits>()

const goToNextStep = () => {
  emit('next-step')
}
</script>
