<template>
  <!-- Decorative visual for one "Why GitVault" reason -->
  <template v-if="reason === 'free'">
    <span
      class="price"
      aria-hidden="true"
    >{{ $t('landing.why.free.price') }} <small>{{ $t('landing.why.free.perMonth') }}</small></span>
    <div
      class="mock plan"
      aria-hidden="true"
    >
      <div class="mock-h">
        <UIcon
          name="i-simple-icons-github"
          class="ic"
        />{{ $t('landing.why.free.plan') }}
      </div>
      <div class="mock-b">
        <div class="plan-row">
          <span>{{ $t('landing.why.free.privateRepos') }}</span><b><UIcon
            name="i-mdi-check"
            class="ic-sm"
          />{{ $t('landing.why.free.unlimited') }}</b>
        </div>
        <div class="plan-row">
          <span>{{ $t('app.name') }}</span><b><UIcon
            name="i-mdi-check"
            class="ic-sm"
          />{{ $t('landing.why.free.free') }}</b>
        </div>
      </div>
    </div>
  </template>

  <div
    v-else-if="reason === 'yours'"
    class="mock repo"
    aria-hidden="true"
  >
    <div class="mock-b">
      <div class="repo-name">
        <UIcon
          name="i-mdi-source-repository"
          class="ic-sm"
        /><span class="n">{{ $t('landing.why.yours.repo') }}</span><span class="pill">{{ $t('landing.why.yours.private') }}</span>
      </div>
      <span class="topic">gitvault</span>
      <div class="files">
        <div class="folder">
          <UIcon
            name="i-mdi-folder"
            class="ic-sm"
          />{{ $t('landing.mock.folders.photos') }}
        </div>
        <div class="folder">
          <UIcon
            name="i-mdi-folder"
            class="ic-sm"
          />{{ $t('landing.mock.folders.documents') }}
        </div>
        <div>
          <UIcon
            :name="FILE_CATEGORY_ICONS.image"
            class="ic-sm"
          />beach.jpg
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="mock commits"
    aria-hidden="true"
  >
    <div class="mock-h">
      <UIcon
        name="i-simple-icons-github"
        class="ic"
      />{{ $t('landing.why.history.commits') }}
    </div>
    <div class="mock-b">
      <div
        v-for="commit in COMMITS"
        :key="commit.sha"
        class="commit"
      >
        <UIcon
          name="i-mdi-source-commit"
          class="ic-sm"
        />
        <div>
          <b>{{ $t(`landing.why.history.${commit.key}`) }}</b><span class="when">{{ $t(`landing.why.history.${commit.key}When`) }}</span>
        </div>
        <span class="sha">{{ commit.sha }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FILE_CATEGORY_ICONS } from '~/resources/CDNFiles/extensions'

defineProps<{ reason: 'free' | 'yours' | 'history' }>()

const COMMITS = [
  { key: 'c1', sha: '9c1e4a7' },
  { key: 'c2', sha: '5b02d1f' },
  { key: 'c3', sha: 'e7a3390' },
] as const
</script>

<style scoped>
/* price */
.plan { max-width: 290px; }
.plan .mock-b { gap: 0; padding-block: 6px; }
.plan-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-block: 9px; border-top: 1px solid var(--lp-line); }
.plan-row:first-child { border-top: 0; }
.plan-row b { font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.plan-row .ic-sm { color: var(--lp-ok); }
.price { position: absolute; top: 18px; right: 18px; background: var(--lp-accent-bg); color: var(--lp-accent-ink); border-radius: 999px; padding: 8px 16px; font: 600 22px/1 "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; box-shadow: var(--lp-shadow-lg); transform: rotate(-4deg); white-space: nowrap; }
.price small { font: 500 14px/1 var(--lp-font-text); }
@media (max-width: 480px) { .price { position: static; transform: none; justify-self: start; margin-bottom: -6px; } }
@media (min-width: 900px) {
  /* inside the desktop stage: the chip sits on the card's corner */
  .price { position: relative; top: auto; right: auto; z-index: 1; justify-self: end; margin-bottom: -16px; margin-right: -14px; }
}

/* repo card */
.repo .mock-b { gap: 12px; }
.repo-name { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; min-width: 0; }
.repo-name .ic-sm { color: var(--lp-muted); }
.repo-name .n { color: var(--lp-primary-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pill { border: 1px solid var(--lp-line); border-radius: 999px; padding: 1px 8px; font-size: 11px; font-weight: 600; color: var(--lp-muted); white-space: nowrap; }
.topic { justify-self: start; background: var(--lp-primary-soft); color: var(--lp-primary-ink); border-radius: 999px; padding: 3px 10px; font: 600 12px/1.3 var(--lp-font-mono); outline: 2px solid var(--lp-accent); outline-offset: 2px; }
.files { border: 1px solid var(--lp-line); border-radius: 8px; }
.files div { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-top: 1px solid var(--lp-line); }
.files div:first-child { border-top: 0; }
.files .ic-sm { color: var(--lp-muted); }
.files .folder .ic-sm { color: var(--lp-primary); }

/* commit history */
.commits .mock-b { padding-block: 6px; gap: 0; }
.commit { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding-block: 10px; position: relative; }
.commit + .commit { border-top: 1px solid var(--lp-line); }
.commit .ic-sm { color: var(--lp-muted); margin-top: 1px; }
.commit:first-child .ic-sm { color: var(--lp-accent-ink); }
.commit b { display: block; font-weight: 600; overflow-wrap: anywhere; }
.when { font-size: 12px; color: var(--lp-muted); }
.sha { font: 500 11px/1 var(--lp-font-mono); color: var(--lp-muted); border: 1px solid var(--lp-line); border-radius: 5px; padding: 4px 6px; }
.commit:first-child .sha { background: var(--lp-accent-bg); color: var(--lp-accent-ink); border-color: transparent; }
</style>
