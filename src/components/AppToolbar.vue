<template>
  <UContainer class="my-6">
    <div class="flex items-center gap-6">
      <AppLogo />
      <SearchBar
        class="w-2/3 md:w-1/2"
      />
      <div class="flex-grow" />
      <CreateItemsDropdown
        class="hidden md:block"
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
</script>
