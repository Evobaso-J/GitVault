<template>
  <UCard
    class="max-w-xl bg-neutral-50 dark:bg-gray-800"
    :ui="{
      body: 'flex flex-col items-center justify-center gap-4 text-neutral-700',
    }"
  >
    <UIcon
      class="size-56"
      :name="icon"
    />
    <span class="font-medium text-2xl text-center">{{ title }}</span>
    <span class="font-extralight max-w-md text-center">{{ description }}</span>
    <slot />
  </UCard>
</template>

<script setup lang='ts'>
defineComponent({ name: 'EmptySectionCard' })
type EmptySectionCardProps = {
  icon: string
  title: string
  description: string
}
defineProps<EmptySectionCardProps>()
</script>
