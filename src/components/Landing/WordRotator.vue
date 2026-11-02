<template>
  <!-- Comma inside each word, so the box ends the line. Ghost + current + outgoing share one grid cell. -->
  <span class="rot">
    <span class="w ghost">{{ $t('landing.hero.words.documents') }}</span>
    <span
      v-if="previous"
      :key="`out-${swap}`"
      class="w out"
    >{{ $t(`landing.hero.words.${previous}`) }}</span>
    <span
      :key="`in-${swap}`"
      class="w"
      :class="{ in: swap > 0 }"
    >{{ $t(`landing.hero.words.${current}`) }}</span>
  </span>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const WORDS = ['photos', 'documents', 'music', 'videos', 'files'] as const
type Word = typeof WORDS[number]
const LAST: Word = 'files'
const CYCLES = 3 // then stop on the last word (WCAG 2.2.2)

// SSR, no JS and reduced motion all show the last word.
const current = ref<Word>(LAST)
const previous = ref<Word | null>(null)
const swap = ref(0) // keys the spans, so each swap remounts them and replays the animation

const motion = usePreferredReducedMotion()
let steps = 0
let stepTimer: ReturnType<typeof setTimeout> | undefined
let dropTimer: ReturnType<typeof setTimeout> | undefined
let stopped = false

function step() {
  if (stopped) return
  previous.value = current.value
  current.value = WORDS[steps % WORDS.length]!
  swap.value++
  clearTimeout(dropTimer)
  dropTimer = setTimeout(() => previous.value = null, 550)
  steps++
  if (steps < WORDS.length * CYCLES) {
    // One brisk pass, then slower.
    stepTimer = setTimeout(step, steps < WORDS.length ? 1300 : 2500)
  }
}

function stop() {
  stopped = true
  clearTimeout(stepTimer)
  clearTimeout(dropTimer)
  previous.value = null
  current.value = LAST
}

onMounted(() => {
  if (motion.value === 'reduce') return
  document.fonts.ready.then(() => {
    if (!stopped) stepTimer = setTimeout(step, 700)
  })
})
watch(motion, (value) => {
  if (value === 'reduce') stop()
})
onBeforeUnmount(stop)
</script>

<style scoped>
.rot { display: inline-grid; color: var(--lp-primary); clip-path: inset(0 -2em 0 -0.1em); }
/* Both words move exactly one word-height in lockstep. The padding gives descenders room inside the clip;
   the negative margin keeps the line height unchanged. */
.w { grid-area: 1 / 1; white-space: nowrap; padding-bottom: .14em; margin-bottom: -.14em; }
/* Invisible copy of the longest word: the box keeps that width, so nothing around it reflows. */
.ghost { visibility: hidden; }
.in { animation: w-in .5s cubic-bezier(.65, 0, .35, 1) both; }
.out { animation: w-out .5s cubic-bezier(.65, 0, .35, 1) both; }
@keyframes w-in { from { transform: translateY(100%); } }
@keyframes w-out { to { transform: translateY(-100%); } }
@media (prefers-reduced-motion: reduce) { .in, .out { animation: none; } }
</style>
