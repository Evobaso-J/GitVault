<template>
  <UContainer class="my-6">
    <div class="flex items-center gap-6">
      <AppLogo />
      <SearchBar />
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
</script>
