<template>
  <UCard
    class="h-full overflow-hidden aspect-square"
    :ui="{
      rounded: 'rounded-l-[5rem] rounded-r-none',
      body: {
        padding: '',
      },
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
