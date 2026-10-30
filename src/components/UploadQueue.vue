<template>
  <section
    v-if="uploads.length"
    :aria-label="$t('uploadQueue.label')"
    class="fixed z-50 right-4 bottom-24 md:right-6 md:bottom-6 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-default bg-default shadow-lg overflow-hidden"
  >
    <header class="flex items-center justify-between gap-2 pl-4 pr-2 py-2 border-b border-default">
      <strong
        role="status"
        class="text-sm"
      >{{ title }}</strong>
      <div class="flex">
        <UButton
          :aria-label="$t(isCollapsed ? 'uploadQueue.expand' : 'uploadQueue.collapse')"
          :icon="isCollapsed ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'"
          color="neutral"
          variant="ghost"
          @click="isCollapsed = !isCollapsed"
        />
        <UButton
          v-if="!pending"
          :aria-label="$t('uploadQueue.close')"
          icon="i-mdi-close"
          color="neutral"
          variant="ghost"
          @click="clearUploads()"
        />
      </div>
    </header>
    <ul
      v-if="!isCollapsed"
      class="max-h-80 overflow-y-auto py-1 text-sm"
    >
      <li
        v-for="upload in uploads"
        :key="upload.id"
        class="flex flex-col gap-2 px-4 py-2"
        :class="{ 'bg-warning/10': upload.status === 'conflict' }"
      >
        <div class="flex items-center gap-2.5">
          <UIcon
            :name="STATUS_ICONS[upload.status]"
            class="size-4 shrink-0"
            :class="{
              'text-success': upload.status === 'done',
              'text-error': upload.status === 'error',
              'text-warning': upload.status === 'conflict',
              'text-muted': ['waiting', 'skipped'].includes(upload.status),
              'animate-spin': upload.status === 'uploading',
            }"
          />
          <span class="flex-1 min-w-0 truncate">
            <i18n-t
              v-if="upload.status === 'conflict'"
              keypath="uploadQueue.exists"
            >
              <template #name><strong>{{ upload.file.name }}</strong></template>
            </i18n-t>
            <template v-else>{{ upload.path.split('/').pop() }}</template>
          </span>
          <span
            v-if="upload.status !== 'conflict'"
            class="text-xs text-muted"
          >{{ $t(`uploadQueue.status.${upload.status}`) }}</span>
        </div>
        <div
          v-if="upload.status === 'conflict'"
          class="flex flex-wrap gap-1.5 pl-6"
        >
          <UButton
            :label="$t('replace')"
            size="xs"
            color="neutral"
            variant="outline"
            @click="resolveConflict(upload.id, 'replace')"
          />
          <UButton
            :label="$t('uploadQueue.keepBoth')"
            size="xs"
            color="neutral"
            variant="outline"
            @click="resolveConflict(upload.id, 'keepBoth')"
          />
          <UButton
            :label="$t('uploadQueue.skip')"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="resolveConflict(upload.id, 'skip')"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang='ts'>
import type { UploadStatus } from '~/composables/useVaultContents'

defineComponent({ name: 'UploadQueue' })

const STATUS_ICONS: Record<UploadStatus, string> = {
  waiting: 'i-mdi-circle-outline',
  uploading: 'i-mdi-loading',
  conflict: 'i-mdi-alert-circle-outline',
  done: 'i-mdi-check',
  skipped: 'i-mdi-skip-next-outline',
  error: 'i-mdi-alert-outline',
}

const { t } = useI18n()
const { uploads, resolveConflict, clearUploads } = useVaultContents()

const isCollapsed = ref(false)
const pending = computed(() => uploads.value.some(upload => ['waiting', 'uploading', 'conflict'].includes(upload.status)))

const title = computed(() => {
  const total = uploads.value.length
  const finished = uploads.value.filter(upload => ['done', 'skipped', 'error'].includes(upload.status)).length
  if (!pending.value) return t('uploadQueue.finished', total)
  if (uploads.value.some(upload => upload.status === 'conflict')) return t('uploadQueue.needsChoice')
  return t('uploadQueue.uploading', { current: Math.min(finished + 1, total), total })
})
</script>
