<template>
  <!-- Decorative replica of the vault page (layouts/default.vue + FolderContents), built in HTML/CSS -->
  <div
    class="app"
    role="img"
    :aria-label="$t('landing.mock.label')"
  >
    <div
      class="app-bar"
      aria-hidden="true"
    >
      <i /><i /><i />
    </div>
    <div
      class="app-body"
      aria-hidden="true"
    >
      <div class="side">
        <div class="side-brand">
          <LandingLogo class="logo size-6" />{{ $t('app.name') }}
        </div>
        <div class="side-label">
          {{ $t('vaults') }}
        </div>
        <div class="nav-item on">
          <UIcon
            name="i-mdi-archive-outline"
            class="ic"
          />personal
        </div>
        <div class="nav-item">
          <UIcon
            name="i-mdi-archive-outline"
            class="ic"
          />family-photos
        </div>
        <div class="nav-item add">
          <UIcon
            name="i-mdi-plus"
            class="ic"
          />{{ $t('newVault') }}
        </div>
        <div class="nav-item">
          <UIcon
            name="i-mdi-cellphone-arrow-down"
            class="ic"
          />{{ $t('phoneBackup.title') }}
        </div>
        <div class="side-foot">
          <span class="avatar" />{{ $t('landing.mock.you') }}<UIcon
            name="i-mdi-unfold-more-horizontal"
            class="ic-sm"
          />
        </div>
      </div>

      <div class="main">
        <div class="navbar">
          <div class="crumb">
            <UIcon
              name="i-mdi-archive-outline"
              class="ic"
            />personal
          </div>
          <div class="tools">
            <span class="ubtn outlined search"><UIcon
              name="i-mdi-magnify"
              class="ic-sm"
            /><span class="lbl">{{ $t('searchVault') }}</span><kbd>⌘</kbd><kbd>K</kbd></span>
            <span class="ubtn outlined"><UIcon
              name="i-mdi-folder-plus-outline"
              class="ic-sm"
            />{{ $t('newFolder') }}</span>
            <span class="ubtn solid"><UIcon
              name="i-mdi-upload"
              class="ic-sm"
            /><span class="lbl">{{ $t('uploadFile') }}</span></span>
          </div>
        </div>

        <div class="panel-body">
          <div class="listing">
            <p class="summary">
              {{ $t('landing.mock.summary') }}
            </p>
            <div class="tbl">
              <div class="tr th">
                <span>{{ $t('name') }}</span><span class="td-meta">{{ $t('type') }}</span><span class="td-meta">{{ $t('size') }}</span><span />
              </div>
              <div
                v-for="folder in FOLDERS"
                :key="folder"
                class="tr folder"
              >
                <div class="td-name">
                  <UIcon
                    name="i-mdi-folder"
                    class="ic"
                  /><span class="nm">{{ $t(`landing.mock.folders.${folder}`) }}</span>
                </div>
                <span class="td-meta">{{ $t('folder') }}</span><span class="td-meta" />
                <div class="acts">
                  <span class="ab hover"><UIcon
                    name="i-mdi-trash-can-outline"
                    class="ic-sm"
                  /></span>
                </div>
              </div>
              <div
                v-for="file in FILES"
                :key="file.name"
                class="tr"
                :class="{ sel: file.selected }"
              >
                <div class="td-name">
                  <UIcon
                    :name="FILE_CATEGORY_ICONS[file.category]"
                    class="ic"
                  /><span class="nm">{{ file.name }}</span>
                </div>
                <span class="td-meta">{{ $t(`fileCategory.${file.category}`) }}</span><span class="td-meta">{{ file.size }}</span>
                <div class="acts">
                  <span class="ab hover"><UIcon
                    name="i-mdi-download-outline"
                    class="ic-sm"
                  /></span><span class="ab hover"><UIcon
                    name="i-mdi-link-variant"
                    class="ic-sm"
                  /></span><span class="ab"><UIcon
                    name="i-mdi-dots-vertical"
                    class="ic-sm"
                  /></span>
                </div>
              </div>
            </div>
            <p class="drop">
              <UIcon
                name="i-mdi-upload"
                class="ic-sm"
              />{{ $t('dropZone.hint', { location: 'personal' }) }}
            </p>
          </div>

          <div class="preview">
            <div class="pv-top">
              {{ $t('preview') }}<UIcon
                name="i-mdi-close"
                class="ic"
              />
            </div>
            <div class="pv-img" />
            <div>
              <p class="pv-name">
                beach.jpg
              </p>
              <p class="pv-meta">
                {{ $t('fileCategory.image') }} · 3.8 MB
              </p>
            </div>
            <div class="pv-acts">
              <span class="ubtn solid"><UIcon
                name="i-mdi-download-outline"
                class="ic-sm"
              />{{ $t('download') }}</span>
              <span class="ubtn outlined"><UIcon
                name="i-mdi-link-variant"
                class="ic-sm"
              />{{ $t('copyLink') }}</span>
            </div>
          </div>
        </div>

        <!-- Upload queue (UploadQueue.vue): one file at a time, Waiting → Uploading → Done -->
        <div class="queue">
          <div class="q-head">
            <span>{{ queueTitle }}</span><UIcon
              name="i-mdi-chevron-down"
              class="ic"
            />
          </div>
          <ul class="q-list">
            <li
              v-for="(upload, index) in UPLOADS"
              :key="upload"
              :data-s="statuses[index]"
            >
              <UIcon
                :name="STATUS_ICONS[statuses[index]!]"
                class="ic-sm q-ic"
              /><span class="q-name">{{ upload }}</span><span class="q-st">{{ $t(`uploadQueue.status.${statuses[index]}`) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { FILE_CATEGORY_ICONS } from '~/resources/CDNFiles/extensions'

const FOLDERS = ['photos', 'documents', 'music', 'videos'] as const
const FILES = [
  { name: 'beach.jpg', category: 'image', size: '3.8 MB', selected: true },
  { name: 'tax-return-2025.pdf', category: 'pdf', size: '1.2 MB', selected: false },
  { name: 'voice-memo.m4a', category: 'audio', size: '6.1 MB', selected: false },
] as const
const UPLOADS = ['sunset-pier.jpg', 'hike-2026.jpg', 'lease.pdf']
type Status = 'waiting' | 'uploading' | 'done'
const STATUS_ICONS: Record<Status, string> = {
  waiting: 'i-mdi-circle-outline',
  uploading: 'i-mdi-loading',
  done: 'i-mdi-check',
}

const { t } = useI18n()

// SSR / no JS / reduced motion: the static mid-upload frame. With motion it plays once to "3 uploads done" (WCAG 2.2.2).
const statuses = ref<Status[]>(['done', 'uploading', 'waiting'])
const queueTitle = computed(() => {
  const uploading = statuses.value.indexOf('uploading')
  return uploading === -1
    ? t('uploadQueue.finished', UPLOADS.length)
    : t('uploadQueue.uploading', { current: uploading + 1, total: UPLOADS.length })
})

const motion = usePreferredReducedMotion()
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  const uploading = statuses.value.indexOf('uploading')
  if (uploading === -1) return
  const next = [...statuses.value]
  next[uploading] = 'done'
  if (uploading + 1 < next.length) next[uploading + 1] = 'uploading'
  statuses.value = next
  if (uploading + 1 < next.length) timer = setTimeout(tick, 1800)
}

onMounted(() => {
  if (motion.value !== 'reduce') timer = setTimeout(tick, 2000)
})
watch(motion, (value) => {
  if (value === 'reduce') clearTimeout(timer)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.app { container: app / inline-size; position: relative; background: var(--lp-raised); border: 1px solid var(--lp-line); border-radius: 14px; box-shadow: var(--lp-shadow); overflow: hidden; font: 400 14px/1.4 var(--lp-font-text); }
.app-bar { display: flex; align-items: center; gap: 6px; height: 34px; padding-inline: 14px; border-bottom: 1px solid var(--lp-line); background: var(--lp-surface); }
.app-bar i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
.app-bar i:nth-child(2) { background: #febc2e; }
.app-bar i:nth-child(3) { background: #28c840; }
.app-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 470px; }

/* sidebar: UDashboardSidebar, bg-elevated/50 */
.side { border-right: 1px solid var(--lp-line); background: color-mix(in srgb, var(--lp-surface) 60%, transparent); padding: 14px 10px; display: flex; flex-direction: column; gap: 2px; }
.side-brand { display: flex; align-items: center; gap: 8px; padding: 2px 8px 16px; font-weight: 700; font-size: 17px; }
.nav-item.on { background: var(--lp-surface-2); color: var(--lp-fg); }
.nav-item.on .ic { color: var(--lp-primary); }
.nav-item.add { color: var(--lp-primary); }
.side-foot { margin-top: auto; display: flex; align-items: center; gap: 8px; padding: 10px 10px 2px; border-top: 1px solid var(--lp-line); color: var(--lp-fg); font-weight: 500; }
.side-foot .ic-sm { margin-left: auto; color: var(--lp-muted); }
.avatar { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, var(--lp-primary-line), var(--lp-primary)); }

/* navbar: UDashboardNavbar */
.main { min-width: 0; display: flex; flex-direction: column; position: relative; }
.navbar { display: flex; align-items: center; gap: 10px; height: 56px; padding-inline: 18px; border-bottom: 1px solid var(--lp-line); }
.crumb { display: flex; align-items: center; gap: 6px; font-weight: 600; min-width: 0; }
.crumb .ic { color: var(--lp-muted); }
.tools { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.ubtn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding-inline: 10px; border-radius: 6px; font-weight: 500; font-size: 13px; white-space: nowrap; }
.ubtn.outlined { border: 1px solid var(--lp-line); color: var(--lp-fg); background: var(--lp-raised); }
.ubtn.solid { background: var(--lp-primary); color: var(--lp-primary-fg); }
.ubtn.search { width: 236px; color: var(--lp-muted); }
.ubtn.search .lbl { flex: 1; }
kbd { font: 500 11px/1 var(--lp-font-text); color: var(--lp-muted); border: 1px solid var(--lp-line); border-radius: 4px; padding: 3px 5px; background: var(--lp-surface); }

/* body: listing + preview panel */
.panel-body { display: flex; gap: 20px; padding: 18px; min-width: 0; flex: 1; }
.listing { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.summary { font-size: 13px; color: var(--lp-muted); }
.tbl { border: 1px solid var(--lp-line); border-radius: 8px; overflow: hidden; }
.tr { display: grid; grid-template-columns: minmax(0, 1fr) 76px 64px 84px; align-items: center; gap: 10px; padding-inline: 14px; min-height: 44px; border-bottom: 1px solid var(--lp-line); }
.tr:last-child { border-bottom: 0; }
.th { min-height: 38px; font-weight: 600; color: var(--lp-fg); font-size: 13px; }
.td-name { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 500; }
.nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-name .ic { color: var(--lp-muted); }
.tr.folder .td-name .ic { color: var(--lp-primary); }
.td-meta { color: var(--lp-muted); white-space: nowrap; }
.tr.sel { background: var(--lp-surface-2); }
.acts { display: flex; justify-content: flex-end; gap: 2px; color: var(--lp-muted); }
.ab { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 6px; }
.acts .hover { opacity: 0; }
.tr.sel .acts .hover, .tr:hover .acts .hover { opacity: 1; }
.tr.folder .acts { color: var(--lp-error); }
.drop { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 8px; border: 1px dashed var(--lp-primary-line); font-size: 13px; color: var(--lp-muted); }

.preview { width: 280px; flex: none; border-left: 1px solid var(--lp-line); padding-left: 20px; display: flex; flex-direction: column; gap: 14px; }
.pv-top { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--lp-muted); }
.pv-img { height: 168px; border-radius: 8px; position: relative; overflow: hidden; background: linear-gradient(180deg, var(--lp-sky) 0 52%, var(--lp-sea) 52% 72%, var(--lp-sand) 72%); }
.pv-img::after { content: ""; position: absolute; width: 34px; height: 34px; border-radius: 50%; background: var(--lp-sun); top: 22px; right: 40px; }
.pv-name { font-size: 16px; font-weight: 600; }
.pv-meta { font-size: 13px; color: var(--lp-muted); }
.pv-acts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pv-acts .ubtn { justify-content: center; }

/* upload queue: fixed bottom-right in the app */
.queue { position: absolute; right: 16px; bottom: 16px; width: 270px; background: var(--lp-raised); border: 1px solid var(--lp-line); border-radius: 12px; box-shadow: var(--lp-shadow-lg); overflow: hidden; z-index: 2; }
.q-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 8px 14px; border-bottom: 1px solid var(--lp-line); font-weight: 600; font-size: 13px; }
.q-head .ic { color: var(--lp-muted); }
.q-list { list-style: none; margin: 0; padding: 4px 0; }
.q-list li { display: flex; align-items: center; gap: 9px; padding: 6px 14px; font-size: 13px; }
.q-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.q-st { font-size: 12px; color: var(--lp-muted); }
.q-ic { color: var(--lp-muted); }
li[data-s="done"] .q-ic { color: var(--lp-ok); }
li[data-s="uploading"] .q-ic { color: var(--lp-fg); animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* The mock adapts to its own width, so it works both under the headline and beside it. */
@container app (max-width: 980px) { .preview { display: none; } }
@container app (max-width: 900px) { .ubtn.search { width: auto; } .ubtn.search .lbl, .ubtn.search kbd { display: none; } }
@container app (max-width: 640px) {
  .app-body { grid-template-columns: 1fr; }
  .side { display: none; }
}
@container app (max-width: 520px) {
  .app-bar { display: none; }
  .navbar { padding-inline: 12px; }
  .ubtn.outlined:not(.search), .ubtn.solid .lbl, .drop { display: none; }
  .panel-body { padding: 12px; }
  .tr { grid-template-columns: minmax(0, 1fr) 30px; padding-inline: 12px; }
  .tr > .td-meta { display: none; }
  .acts .hover { display: none; }
  .app-body { min-height: 0; }
  .queue { right: 10px; bottom: 10px; width: min(250px, calc(100% - 20px)); }
}
</style>
