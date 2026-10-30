<template>
  <div class="mx-auto max-w-md flex flex-col gap-6 py-6">
    <div class="flex flex-col items-center gap-2 text-center">
      <UIcon
        name="i-mdi-image-multiple-outline"
        class="size-12 text-primary"
      />
      <h1 class="text-xl font-semibold text-highlighted">
        {{ $t('galleryBackup.title') }}
      </h1>
      <p class="text-sm text-muted">
        {{ $t('galleryBackup.description') }}
      </p>
    </div>

    <UButton
      :label="$t('galleryBackup.pick')"
      icon="i-mdi-image-plus-outline"
      size="xl"
      block
      :loading="isChecking"
      @click="open({ accept: 'image/*,video/*', multiple: true })"
    />

    <UAlert
      v-if="hasFailed"
      color="error"
      variant="subtle"
      icon="i-mdi-alert-outline"
      :title="$t('galleryBackup.error')"
    />
    <ul
      v-else-if="plan"
      role="status"
      class="flex flex-col gap-2 text-sm"
    >
      <li class="flex items-center gap-2">
        <UIcon
          name="i-mdi-upload-outline"
          class="size-4 text-primary"
        />
        {{ $t('galleryBackup.new', plan.newFiles.length) }}
      </li>
      <li class="flex items-center gap-2">
        <UIcon
          name="i-mdi-check"
          class="size-4 text-success"
        />
        {{ $t('galleryBackup.backedUp', plan.backedUp.length) }}
      </li>
      <li
        v-if="plan.tooLarge.length"
        class="flex items-start gap-2"
      >
        <UIcon
          name="i-mdi-alert-outline"
          class="size-4 shrink-0 mt-0.5 text-warning"
        />
        <span class="min-w-0 break-words">
          {{ $t('galleryBackup.tooLarge', { n: plan.tooLarge.length, size: formatBytes(MAX_UPLOAD_BYTES) }, plan.tooLarge.length) }}
          {{ plan.tooLarge.map(file => file.name).join(', ') }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { MAX_UPLOAD_BYTES } from '~/config'
import type { GalleryBackupPlan } from '~/utils/galleryBackup'

const { t } = useI18n()
useHead({
  title: t('galleryBackup.title'),
})
definePageMeta({
  middleware: ['00-auth', '03-active-repo'],
})

const { params: { repo } } = useRoute()
const { upload } = useVaultContents()

/** Shas of every file in the vault; an empty repo has no tree yet */
const fetchVaultShas = async (): Promise<Set<string>> => {
  try {
    const { tree } = await $fetch('/gh-repo-tree', { query: { repo } })
    return new Set(tree.flatMap(item => item.type === 'blob' && item.sha ? [item.sha] : []))
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 409) return new Set()
    throw error
  }
}

const plan = ref<GalleryBackupPlan>()
const isChecking = ref(false)
const hasFailed = ref(false)

const { open, onChange, reset } = useFileDialog()
onChange(async (files) => {
  if (!files?.length) return
  const picked = Array.from(files)
  reset()
  plan.value = undefined
  hasFailed.value = false
  isChecking.value = true
  try {
    plan.value = await planGalleryBackup(picked, await fetchVaultShas(), MAX_UPLOAD_BYTES)
    // Progress shows in the upload queue
    upload(plan.value.newFiles, getGalleryPath)
  }
  catch {
    hasFailed.value = true
  }
  finally {
    isChecking.value = false
  }
})
</script>
