<template>
  <div
    aria-busy="true"
    class="flex flex-col gap-2 overflow-hidden rounded-lg bg-elevated p-4"
  >
    <USkeleton
      v-for="width in LINE_WIDTHS"
      :key="width"
      class="h-3 bg-accented"
      :style="{ width }"
    />
  </div>
</template>

<script setup lang='ts'>
defineComponent({ name: 'FilePreviewSkeleton' })

const LINE_WIDTHS = ['62%', '48%', '75%', '36%', '58%', '44%']
</script>
