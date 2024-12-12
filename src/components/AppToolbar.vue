<template>
  <UContainer class="my-6">
    <div class="flex items-center gap-4">
      <AppLogo />
      <UInput
        v-model="search"
        :placeholder="$t('search')"
        size="xl"
        icon="i-mdi-magnify"
        :ui="{ icon: { trailing: { pointer: '' } } }"
        class="w-1/2"
      >
        <template #trailing>
          <UButton
            v-show="!!search"
            class="text-gray-500"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            :padded="false"
            @click="search = undefined"
          />
        </template>
      </UInput>
    </div>
  </UContainer>
</template>

<script setup lang='ts'>
defineComponent({ name: 'AppToolbar' })

const search = defineModel<string | undefined>(undefined)
</script>
