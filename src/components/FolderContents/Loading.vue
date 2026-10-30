<template>
  <div
    aria-busy="true"
    class="flex flex-col gap-3"
  >
    <USkeleton class="h-4 w-44" />
    <div class="border border-default rounded-lg overflow-hidden">
      <div class="h-10 bg-elevated/50 border-b border-default" />
      <div
        v-for="width in ROW_WIDTHS"
        :key="width"
        class="flex items-center gap-3 h-12 px-4 border-b border-default last:border-0"
      >
        <USkeleton class="size-5 shrink-0" />
        <USkeleton
          class="h-3"
          :style="{ width }"
        />
      </div>
    </div>
    <span
      role="status"
      class="sr-only"
    >{{ $t('loadingFolder') }}</span>
  </div>
</template>

<script setup lang='ts'>
defineComponent({ name: 'FolderContentsLoading' })

const ROW_WIDTHS = ['38%', '22%', '30%', '46%', '26%', '34%', '20%', '40%']
</script>
