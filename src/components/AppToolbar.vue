<template>
  <UContainer class="my-6">
    <div class="flex items-center gap-6">
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
      <div class="flex-grow" />
      <CreateItemsDropdown
        :popper="{ placement: 'auto' }"
      >
        <template #activator>
          <UButton
            icon="i-mdi-plus"
            :label="$t('create')"
            size="xl"
          />
        </template>
      </CreateItemsDropdown>
    </div>
  </UContainer>
</template>

<script setup lang='ts'>
defineComponent({ name: 'AppToolbar' })

const search = defineModel<string | undefined>(undefined)

const { foundItems } = useSearch(search)
</script>
