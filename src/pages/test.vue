<template>
  <section>
    {{ fit }}
    <button
      @click="fit = fit === 'object-cover' ? 'object-contain' : 'object-cover'"
    >
      Change fit
    </button>
    <div class="size-80 bg-red-600 p-4">
      <UCard
        :ui="{
          rounded: 'rounded-none rounded-b-lg',
          background: 'bg-gray-50 dark:bg-gray-800',
          ring: 'ring-0',
          body: {
            padding: 'p-0 sm:p-0 max-h-full',
          },
        }"
        class="h-36"
      >
        <NuxtImg
          :class="fit"
          class="w-full h-full"
          src="https://raw.githubusercontent.com/Evobaso-J/gitvault-starter/main/topi/amano_monk.jpg?token=ANZGHLXBQJ2RDGLMVCHCRMDHUE5SG"
        />
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const fit = ref<'object-cover' | 'object-contain'>('object-cover')
</script>
