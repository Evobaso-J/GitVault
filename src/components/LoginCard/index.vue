<template>
  <UCard
    class="h-full overflow-hidden aspect-square rounded-none"
    :ui="{
      body: 'p-0 sm:p-0',
    }"
  >
    <div class="grid grid-cols-7 grid-rows-7 gap-0">
      <div
        v-for="i in 7 * 7"
        :key="i"
        class="col-span-1 aspect-square"
      >
        <LoginCardCanvasPattern />
      </div>
    </div>
  </UCard>
</template>

<script setup lang='ts'>
defineComponent({ name: 'LoginCard' })
</script>
