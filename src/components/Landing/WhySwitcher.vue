<template>
  <section
    id="why"
    class="band band-tint"
  >
    <div class="wrap">
      <h2 class="h2">
        {{ $t('landing.why.title') }}
      </h2>
      <!-- Below 900px and without JS: a plain list, each visual under its copy. From 900px: vertical tabs + one fixed-height stage. -->
      <div
        class="why-sw"
        :class="{ tabs: isTabs, auto: isAuto }"
        @pointerdown="stopAuto"
        @focusin="stopAuto"
        @keydown="stopAuto"
      >
        <ul
          class="why-tabs"
          :role="isTabs ? 'tablist' : undefined"
          :aria-orientation="isTabs ? 'vertical' : undefined"
          :aria-label="isTabs ? $t('landing.why.title') : undefined"
        >
          <li
            v-for="(reason, index) in REASONS"
            :key="reason.key"
            :class="{ on: index === selected }"
            :role="isTabs ? 'presentation' : undefined"
          >
            <div
              :id="`${id}-tab-${index}`"
              class="why-tab"
              v-bind="isTabs ? {
                'role': 'tab',
                'aria-selected': index === selected,
                'tabindex': index === selected ? 0 : -1,
                'aria-controls': `${id}-panel-${index}`,
                'aria-labelledby': `${id}-title-${index}`,
                'aria-describedby': `${id}-text-${index}`,
              } : {}"
              @click="isTabs && select(index)"
              @keydown="isTabs && onKeydown($event)"
            >
              <span class="wi"><UIcon
                :name="reason.icon"
                class="ic"
              /></span>
              <h3 :id="`${id}-title-${index}`">
                {{ $t(`landing.why.${reason.key}.title`) }}
              </h3>
              <div class="why-p">
                <p :id="`${id}-text-${index}`">
                  {{ $t(`landing.why.${reason.key}.text`) }}
                </p>
              </div>
            </div>
            <div
              v-if="!isTabs"
              class="viz"
              :class="{ 'v-price': reason.key === 'free' }"
            >
              <LandingWhyVisual :reason="reason.key" />
            </div>
          </li>
        </ul>
        <div class="why-stage viz">
          <template v-if="isTabs">
            <div
              v-for="(reason, index) in REASONS"
              :id="`${id}-panel-${index}`"
              :key="reason.key"
              class="viz"
              :class="{ on: index === selected }"
              role="tabpanel"
              :aria-labelledby="`${id}-tab-${index}`"
            >
              <LandingWhyVisual :reason="reason.key" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntervalFn, useMediaQuery, useMounted, usePreferredReducedMotion } from '@vueuse/core'

const REASONS = [
  { key: 'free', icon: 'i-mdi-credit-card-off-outline' },
  { key: 'yours', icon: 'i-mdi-key-outline' },
  { key: 'history', icon: 'i-mdi-history' },
] as const

const id = useId()
const selected = ref(0)

// SSR and first client render are the plain list; tabs only after mount, so hydration matches.
const mounted = useMounted()
const isDesktop = useMediaQuery('(min-width: 900px)')
const isTabs = computed(() => mounted.value && isDesktop.value)
const motion = usePreferredReducedMotion()

// Auto-advance every 5 s until the first interaction; never under reduced motion or below 900px.
const { pause, resume, isActive: isAuto } = useIntervalFn(() => select(selected.value + 1), 5000, { immediate: false })
let touched = false
function stopAuto() {
  touched = true
  pause()
}

function select(index: number, focus = false) {
  selected.value = (index + REASONS.length) % REASONS.length
  if (focus) nextTick(() => document.getElementById(`${id}-tab-${selected.value}`)?.focus())
}

const KEY_STEPS: Record<string, (current: number) => number> = {
  ArrowDown: current => current + 1,
  ArrowRight: current => current + 1,
  ArrowUp: current => current - 1,
  ArrowLeft: current => current - 1,
  Home: () => 0,
  End: () => REASONS.length - 1,
}
function onKeydown(event: KeyboardEvent) {
  const to = KEY_STEPS[event.key]
  if (!to) return
  event.preventDefault()
  select(to(selected.value), true)
}

onMounted(() => {
  if (isTabs.value && motion.value !== 'reduce' && !touched) resume()
})
watch([isTabs, motion], ([tabs, preference]) => {
  if (!tabs || preference === 'reduce') stopAuto()
})
</script>

<style scoped>
.why-sw { --stage-h: 340px; --col: 400px; --gap: 48px; margin-top: 48px; position: relative; }
.why-tabs { list-style: none; margin: 0; padding: 0; display: grid; gap: 40px; }
.why-tabs > li { display: grid; gap: 16px; min-width: 0; }
.why-tab { display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 14px; align-items: center; min-width: 0; }
.wi { width: 36px; height: 36px; border-radius: 10px; background: var(--lp-primary-soft); color: var(--lp-primary); display: grid; place-items: center; }
.why-tab h3 { font-size: 20px; font-weight: 600; letter-spacing: -0.015em; line-height: 1.25; }
.why-p { grid-column: 2; display: grid; grid-template-rows: 1fr; transition: grid-template-rows .3s ease, visibility .3s; }
.why-p p { min-height: 0; overflow: hidden; color: var(--lp-muted); font-size: 16px; max-width: 38ch; padding-top: 6px; }
.why-tabs .viz { min-height: 236px; }
.why-sw .why-stage { display: none; }
@media (max-width: 480px) { .why-tabs .viz.v-price { place-items: start stretch; gap: 14px; } }

@media (min-width: 900px) {
  .why-sw { display: grid; grid-template-columns: minmax(0, var(--col)) minmax(0, 1fr); gap: var(--gap); align-items: start; }
  .why-tabs { gap: 6px; min-height: var(--stage-h); align-content: center; }
  .why-tab { padding: 18px 20px 18px 30px; border-radius: 14px; border: 1px solid transparent; position: relative; }
  .why-tab::before, .why-tab::after { content: ""; position: absolute; left: 12px; top: 18px; bottom: 18px; width: 3px; border-radius: 3px; transform-origin: top; transform: scaleY(0); transition: transform .3s; }
  .why-tab::before { background: var(--lp-primary-line); }
  .why-tab::after { background: var(--lp-primary); }
  .why-tabs > li.on .why-tab { background: var(--lp-raised); border-color: var(--lp-line); }
  .why-tabs > li.on .why-tab::before, .why-tabs > li.on .why-tab::after { transform: none; }
  /* While auto-advancing, the indicator fills over the 5 s interval. It restarts on its own: each step moves .on to another item. */
  .why-sw.auto .why-tabs > li.on .why-tab::after { animation: why-fill 5s linear; }
  .tabs .why-tab { cursor: pointer; }
  .tabs .why-tabs > li:not(.on) .why-tab:hover { background: var(--lp-tint-2); }
  .tabs .why-tabs > li:not(.on) .why-p { grid-template-rows: 0fr; visibility: hidden; }
  .tabs .why-tabs > li:not(.on) .wi { background: var(--lp-tint-2); color: var(--lp-muted); }
  .why-tab:focus-visible { outline-offset: 2px; border-radius: 14px; }

  /* the stage: one dotted panel, visuals stacked in the same cell and crossfaded, so switching never moves the page */
  .why-sw .why-stage { display: grid; height: var(--stage-h); padding: 0; }
  .why-stage > .viz { grid-area: 1 / 1; background: none; border: 0; border-radius: 0; place-content: center; transition: opacity .35s ease, transform .35s ease, visibility .35s; }
  .why-stage > .viz:not(.on) { opacity: 0; visibility: hidden; transform: translateY(12px); }
  .why-stage :deep(.mock) { width: 340px; max-width: 100%; }
  /* no JS (or before mount): visuals stay in their items; show the first one over the stage area */
  .why-sw:not(.tabs) .why-tabs .viz { display: none; }
  .why-sw:not(.tabs) .why-tabs > li:first-child .viz { display: grid; position: absolute; top: 0; right: 0; height: var(--stage-h); width: calc(100% - var(--col) - var(--gap)); }
  .why-sw:not(.tabs) .why-tabs > li:first-child .viz :deep(.mock) { width: 340px; max-width: 100%; }
}
@keyframes why-fill { from { transform: scaleY(0); } }
</style>
