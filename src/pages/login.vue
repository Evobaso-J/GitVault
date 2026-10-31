<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <section class="flex flex-col gap-12 p-6 sm:p-12">
      <div class="flex items-center gap-2">
        <AppLogo size="28" />
        <span class="font-bold text-lg">{{ $t('app.name') }}</span>
      </div>

      <div class="flex-1 flex flex-col justify-center gap-6 max-w-md">
        <h1 class="text-4xl font-bold text-highlighted text-balance">
          {{ $t('signIn.title') }}
        </h1>
        <p class="text-lg text-muted">
          {{ $t('signIn.description') }}
        </p>
        <UButton
          v-if="!loggedIn"
          to="/auth/github"
          external
          icon="i-simple-icons-github"
          :label="$t('signIn.cta')"
          color="neutral"
          size="xl"
          class="self-start"
        />
        <section class="flex flex-col gap-3">
          <h2 class="text-sm font-semibold text-highlighted">
            {{ $t('signIn.howItWorks') }}
          </h2>
          <ol class="flex flex-col gap-2 text-sm text-muted list-decimal ps-5">
            <li>{{ $t('signIn.step1') }}</li>
            <li>{{ $t('signIn.step2') }}</li>
            <li>{{ $t('signIn.step3') }}</li>
          </ol>
        </section>
      </div>
    </section>

    <!-- Decorative: a sketch of the vault view, so the page shows what the product is -->
    <aside
      aria-hidden="true"
      class="hidden lg:flex items-center justify-center bg-primary/5 p-12"
    >
      <div class="w-full max-w-xl grid grid-cols-[9rem_minmax(0,1fr)] rounded-xl border border-default bg-default shadow-xl overflow-hidden text-sm">
        <div class="flex flex-col gap-1 p-3 bg-elevated/50 border-r border-default">
          <span
            v-for="(vault, index) in SAMPLE_VAULTS"
            :key="vault"
            class="px-2 py-1.5 rounded-md truncate"
            :class="index === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted'"
          >{{ vault }}</span>
        </div>
        <div class="flex flex-col">
          <span class="px-4 py-3 border-b border-default text-muted">documents / 2026</span>
          <div
            v-for="file in SAMPLE_FILES"
            :key="file.name"
            class="flex items-center gap-3 px-4 py-2.5 border-b border-default last:border-0"
          >
            <UIcon
              :name="getIconFromFileName(file.name)"
              class="size-4 text-muted"
            />
            <span class="flex-1 truncate">{{ file.name }}</span>
            <span class="text-muted">{{ file.size }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { getIconFromFileName } from '~/resources/CDNFiles/utils'

const SAMPLE_VAULTS = ['personal', 'work', 'photos']
const SAMPLE_FILES = [
  { name: 'cover.png', size: '1.2 MB' },
  { name: 'passport-scan.pdf', size: '3.4 MB' },
  { name: 'budget-2026.xlsx', size: '86 kB' },
  { name: 'notes.md', size: '4 kB' },
  { name: 'trip-video.mp4', size: '24.1 MB' },
]

const { t } = useI18n()
const { loggedIn } = useUserSession()

definePageMeta({
  layout: false,
  middleware: '01-guest',
})

useHead({
  title: t('signIn.pageTitle'),
})

declare module '#auth-utils' {
  interface User {
    id: number
    login: string
  }
}
</script>
