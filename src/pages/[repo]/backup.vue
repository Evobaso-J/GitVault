<template>
  <div class="mx-auto max-w-md flex flex-col gap-6 py-6">
    <div class="flex flex-col items-center gap-2 text-center">
      <UIcon
        name="i-mdi-cellphone-arrow-down"
        class="size-12 text-primary"
      />
      <h1 class="text-xl font-semibold text-highlighted">
        {{ $t('phoneBackup.title') }}
      </h1>
      <p class="text-sm text-muted">
        {{ $t('phoneBackup.description', { repo: vaultLabel }) }}
      </p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-highlighted">
          {{ $t('phoneBackup.now.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ $t('phoneBackup.now.description') }}
        </p>
      </template>
      <div class="flex flex-col gap-4">
        <UButton
          :label="$t('phoneBackup.now.pick')"
          icon="i-mdi-image-plus-outline"
          size="xl"
          block
          :loading="isChecking"
          :disabled="isUploading"
          @click="open({ accept: 'image/*,video/*', multiple: true })"
        />

        <UAlert
          v-if="hasFailed"
          color="error"
          variant="subtle"
          icon="i-mdi-alert-outline"
          :title="$t('phoneBackup.now.error')"
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
            {{ $t('phoneBackup.now.new', plan.newFiles.length) }}
          </li>
          <li class="flex items-center gap-2">
            <UIcon
              name="i-mdi-check"
              class="size-4 text-success"
            />
            {{ $t('phoneBackup.now.backedUp', plan.backedUp.length) }}
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
              {{ $t('phoneBackup.now.tooLarge', { n: plan.tooLarge.length, size: formatBytes(MAX_UPLOAD_BYTES) }, plan.tooLarge.length) }}
              {{ plan.tooLarge.map(file => file.name).join(', ') }}
            </span>
          </li>
        </ul>
        <p
          v-if="isUploading"
          class="text-sm text-muted"
        >
          {{ $t('phoneBackup.now.keepOpen') }}
        </p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-highlighted">
          {{ $t('phoneBackup.auto.title') }}
        </h2>
        <p class="text-sm text-muted">
          {{ $t('phoneBackup.auto.description') }}
        </p>
      </template>
      <div class="flex flex-col gap-4">
        <USkeleton
          v-if="isLoadingAuto"
          class="h-5 w-2/3"
        />
        <UAlert
          v-else-if="hasAutoFailed"
          color="error"
          variant="subtle"
          icon="i-mdi-alert-outline"
          :title="$t('phoneBackup.auto.error')"
          :actions="[{ label: $t('retry'), color: 'neutral', variant: 'outline', onClick: () => refreshAuto() }]"
        />
        <template v-else>
          <UAlert
            v-if="isStale"
            color="warning"
            variant="subtle"
            icon="i-mdi-alert-outline"
            :title="$t('phoneBackup.auto.stale', { days: STALE_DAYS })"
            :description="statusLine"
          />
          <p
            v-else
            role="status"
            class="flex items-center gap-2 text-sm"
          >
            <UIcon
              :name="runs.lastAt ? 'i-mdi-check-circle-outline' : 'i-mdi-clock-outline'"
              class="size-4 shrink-0"
              :class="runs.lastAt ? 'text-success' : 'text-muted'"
            />
            {{ statusLine }}
          </p>

          <div v-if="keys.length">
            <h3 class="mb-2 text-sm font-medium text-highlighted">
              {{ $t('phoneBackup.auto.devices') }}
            </h3>
            <ul class="divide-y divide-default rounded-lg border border-default">
              <li
                v-for="key in keys"
                :key="key.kid"
                class="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <UIcon
                  :name="key.platform === 'ios' ? 'i-mdi-apple' : 'i-mdi-android'"
                  class="size-5 shrink-0"
                />
                <span class="min-w-0 flex-1 truncate">
                  {{ key.platform === 'ios' ? $t('phoneBackup.auto.device.ios') : $t('phoneBackup.auto.device.android') }}
                  <span class="text-muted">· {{ $t('phoneBackup.auto.since', { date: new Date(key.createdAt).toLocaleDateString() }) }}</span>
                </span>
                <UButton
                  :label="$t('phoneBackup.auto.revoke')"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  @click="revoke(key)"
                />
              </li>
            </ul>
            <p class="mt-2 text-xs text-muted">
              {{ $t('phoneBackup.auto.revokeHelp') }}
            </p>
          </div>
        </template>

        <UTabs
          v-model="platform"
          :items="platformTabs"
          :unmount-on-hide="false"
        >
          <template #ios>
            <ol class="flex flex-col gap-4 pt-4 text-sm list-decimal ps-5">
              <li>
                <p
                  v-if="!isIphone"
                  class="mb-2 text-muted"
                >
                  {{ $t('phoneBackup.auto.openOnPhone') }}
                </p>
                <UButton
                  :label="$t('phoneBackup.auto.ios.add')"
                  icon="i-mdi-apple"
                  color="neutral"
                  variant="outline"
                  block
                  :to="IOS_SHORTCUT_URL || undefined"
                  :disabled="!IOS_SHORTCUT_URL"
                  target="_blank"
                />
                <p class="mt-1 text-xs text-muted">
                  {{ $t('phoneBackup.auto.ios.addHelp') }}
                </p>
              </li>
              <li>
                <UButton
                  :label="$t('phoneBackup.auto.ios.connect')"
                  icon="i-mdi-link-variant"
                  block
                  :loading="isConnecting"
                  @click="connectIphone"
                />
                <p class="mt-1 text-xs text-muted">
                  {{ $t('phoneBackup.auto.ios.connectHelp', { repo: vaultLabel }) }}
                </p>
              </li>
              <li>
                <p class="font-medium text-highlighted">
                  {{ $t('phoneBackup.auto.ios.automate') }}
                </p>
                <p class="text-xs text-muted">
                  {{ $t('phoneBackup.auto.ios.automateHelp') }}
                </p>
              </li>
            </ol>
          </template>

          <template #android>
            <ol class="flex flex-col gap-4 pt-4 text-sm list-decimal ps-5">
              <li>
                <UButton
                  :label="$t('phoneBackup.auto.android.install')"
                  icon="i-mdi-android"
                  color="neutral"
                  variant="outline"
                  block
                  :to="HTTP_SHORTCUTS_PLAY_URL"
                  target="_blank"
                />
              </li>
              <li>
                <UButton
                  :label="$t('phoneBackup.auto.android.import')"
                  icon="i-mdi-import"
                  color="neutral"
                  variant="outline"
                  block
                  :to="androidImportUrl"
                  :disabled="!androidImportUrl"
                  target="_blank"
                />
                <p class="mt-1 text-xs text-muted">
                  {{ $t('phoneBackup.auto.android.importHelp', { url: ingestUrl }) }}
                </p>
              </li>
              <li>
                <UButton
                  v-if="!androidKey"
                  :label="$t('phoneBackup.auto.android.generate')"
                  icon="i-mdi-key-variant"
                  block
                  :loading="isGenerating"
                  @click="generateAndroidKey"
                />
                <div
                  v-else
                  class="flex flex-col gap-3"
                >
                  <UFormField
                    :label="$t('phoneBackup.auto.key.label')"
                    :help="$t('phoneBackup.auto.key.shownOnce')"
                  >
                    <UInput
                      :model-value="androidKey"
                      readonly
                      class="w-full"
                      :ui="{ trailing: 'pe-1' }"
                    >
                      <template #trailing>
                        <UButton
                          :aria-label="$t('phoneBackup.auto.key.copy')"
                          :icon="copied ? 'i-mdi-check' : 'i-mdi-content-copy'"
                          color="neutral"
                          variant="link"
                          @click="copy(androidKey)"
                        />
                      </template>
                    </UInput>
                  </UFormField>
                  <UAlert
                    color="warning"
                    variant="subtle"
                    icon="i-mdi-alert-outline"
                    :title="$t('phoneBackup.auto.key.warningTitle')"
                    :description="$t('phoneBackup.auto.key.warning', { repo: vaultLabel })"
                  />
                  <p class="text-xs text-muted">
                    {{ $t('phoneBackup.auto.android.paste') }}
                  </p>
                </div>
              </li>
              <li>
                {{ $t('phoneBackup.auto.android.share') }}
              </li>
            </ol>
          </template>
        </UTabs>
      </div>
    </UCard>

    <p class="text-center text-xs text-muted">
      {{ $t('phoneBackup.footnote', { folder: BACKUP_FOLDER, size: formatBytes(MAX_UPLOAD_BYTES) }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useClipboard, useFileDialog, useTimeAgo, useWakeLock } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'
import { ANDROID_SHORTCUT_ZIP, getVaultLabel, HTTP_SHORTCUTS_IMPORT_URL, HTTP_SHORTCUTS_PLAY_URL, IOS_SHORTCUT_URL } from '~/config'
import { parseBackupRuns } from '~/resources/BackupRuns/parse'

const DAY_MS = 24 * 60 * 60 * 1000
/** A connected phone that sent nothing for this long is probably not running its automation */
const STALE_DAYS = 2

const { t } = useI18n()
useHead({
  title: t('phoneBackup.title'),
})
definePageMeta({
  middleware: ['00-auth', '03-active-repo'],
})

const route = useRoute()
const repo = String(route.params.repo)
const vaultLabel = getVaultLabel(repo)
const { uploads, upload } = useVaultContents()

// --- Back up now

const isUploading = computed(() => uploads.value.some(item => item.status === 'waiting' || item.status === 'uploading'))
// Mobile browsers pause the page when the screen locks: keep it on while files upload
const wakeLock = useWakeLock()
watch(isUploading, uploading => (uploading ? wakeLock.request('screen') : wakeLock.release()).catch(() => {}), { immediate: true })

/** Every file in the vault; an empty repo has no tree yet */
const fetchTree = async () => {
  try {
    const { tree } = await $fetch('/gh-repo-tree', { query: { repo } })
    return tree
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 409) return []
    throw error
  }
}

const targetOf = (file: File) => getBackupPath(file.name, yearMonthOf(new Date(file.lastModified)))

type BackupPlan = { newFiles: File[], backedUp: File[], tooLarge: File[] }
const plan = ref<BackupPlan>()
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
    const index = indexTree(await fetchTree())
    const vaultShas = new Set(index.shas)
    const planned = new Map<File, string>()
    const result: BackupPlan = { newFiles: [], backedUp: [], tooLarge: [] }
    // One file at a time: hashing reads the whole file into memory, so files over the cap aren't even read
    for (const file of picked) {
      if (file.size > MAX_UPLOAD_BYTES) {
        result.tooLarge.push(file)
        continue
      }
      const sha = await gitBlobSha(file)
      const path = placeFile(index, { target: targetOf(file), sha })
      if (path) {
        planned.set(file, path)
        result.newFiles.push(file)
      }
      // A file picked twice isn't in the vault, so it is neither "already backed up" nor counted again
      else if (vaultShas.has(sha)) {
        result.backedUp.push(file)
      }
    }
    plan.value = result
    // Progress shows in the upload queue. The path was picked against the tree; keepBoth covers a truncated tree
    upload(result.newFiles, { getPath: file => planned.get(file) ?? targetOf(file), keepBoth: true })
  }
  catch {
    hasFailed.value = true
  }
  finally {
    isChecking.value = false
  }
})

// --- Automatic daily backup

const { keys, status: keysStatus, error: keysError, refresh: refreshKeys, create, revoke, ingestUrl } = useUploadKeys()

const since = new Date(Date.now() - 30 * DAY_MS).toISOString()
const { data: commits, status: runsStatus, error: runsError, refresh: refreshRuns } = useFetch('/gh-repo-commits', {
  query: { repo, path: BACKUP_FOLDER, since },
})
const runs = computed(() => parseBackupRuns(commits.value))
const lastAgo = useTimeAgo(() => runs.value.lastAt ?? 0)

const isLoadingAuto = computed(() => keysStatus.value === 'pending' || runsStatus.value === 'pending')
// A repo without commits yet has no history: not an error
const hasAutoFailed = computed(() => !!keysError.value || (!!runsError.value && runsError.value.statusCode !== 409))
const refreshAuto = () => Promise.all([refreshKeys(), refreshRuns()])

const statusLine = computed(() => runs.value.lastAt
  ? t('phoneBackup.auto.last', { ago: lastAgo.value, n: runs.value.countLast24h }, runs.value.countLast24h)
  : t('phoneBackup.auto.never'))
const isStale = computed(() => {
  if (!keys.value.length) return false
  // Newest of: last run, last connection. ISO UTC strings sort as dates
  const latest = [runs.value.lastAt, ...keys.value.map(key => key.createdAt)].filter(Boolean).sort().pop() ?? ''
  return Date.now() - new Date(latest).getTime() > STALE_DAYS * DAY_MS
})

const isIphone = /iPhone|iPad|iPod/.test(navigator.userAgent)
const platform = ref(isIphone ? 'ios' : 'android')
const platformTabs: TabsItem[] = [
  { label: t('phoneBackup.auto.device.ios'), icon: 'i-mdi-apple', value: 'ios', slot: 'ios' },
  { label: t('phoneBackup.auto.device.android'), icon: 'i-mdi-android', value: 'android', slot: 'android' },
]

// iOS: the key goes straight to the shortcut, never shown
const isConnecting = ref(false)
const connectIphone = async () => {
  isConnecting.value = true
  const issued = await create('ios')
  isConnecting.value = false
  if (issued) location.href = iosConnectUrl(ingestUrl, issued.key)
}

// Android: the key is pasted into HTTP Shortcuts by hand, shown once
const androidKey = ref<string>()
const isGenerating = ref(false)
const { copy, copied } = useClipboard()
const generateAndroidKey = async () => {
  isGenerating.value = true
  androidKey.value = (await create('android'))?.key
  isGenerating.value = false
}
const androidImportUrl = ANDROID_SHORTCUT_ZIP ? HTTP_SHORTCUTS_IMPORT_URL + encodeURIComponent(new URL(ANDROID_SHORTCUT_ZIP, useRequestURL()).toString()) : undefined
</script>
