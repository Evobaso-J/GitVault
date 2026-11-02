<template>
  <section
    id="faq"
    class="band"
  >
    <div class="wrap">
      <h2 class="h2">
        {{ $t('landing.faq.title') }}
      </h2>
      <!-- One answer open at a time; the panel reserves the height of its tallest open state,
           so opening a question never moves the content below. -->
      <div
        ref="panel"
        class="faq"
        :style="{ minHeight }"
      >
        <UAccordion
          v-model="open"
          type="single"
          collapsible
          :unmount-on-hide="false"
          :items="items"
          :ui="{ root: 'grid gap-1', item: 'faq-item', trigger: 'faq-q', content: 'faq-c', body: 'faq-a' }"
        >
          <template #trailing="{ open: isOpen }">
            <span
              class="pm"
              :class="{ open: isOpen }"
              aria-hidden="true"
            ><UIcon
              name="i-mdi-plus"
              class="ic-sm"
            /></span>
          </template>
          <template #body="{ item }">
            <i18n-t
              :keypath="`landing.faq.${item.key}.a`"
              tag="p"
              scope="global"
            >
              <template #topic>
                <code>gitvault</code>
              </template>
            </i18n-t>
          </template>
        </UAccordion>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDebounceFn, useEventListener } from '@vueuse/core'

const QUESTIONS = ['cost', 'storage', 'fileSize', 'bulk', 'privacy', 'access', 'existing', 'leave'] as const

const { t } = useI18n()
const items = QUESTIONS.map((key, index) => ({ key, value: String(index), label: t(`landing.faq.${key}.q`) }))

const open = ref<string | undefined>('0')
const panel = useTemplateRef<HTMLElement>('panel')
const minHeight = ref<string>()

// Opens each answer in turn and keeps the tallest panel height. All within one task, so nothing is painted in between.
async function fit() {
  const element = panel.value
  if (!element) return
  const current = open.value
  minHeight.value = undefined
  let max = 0
  for (const item of items) {
    open.value = item.value
    await nextTick()
    max = Math.max(max, element.offsetHeight)
  }
  open.value = current
  minHeight.value = `${max}px`
}

onMounted(() => document.fonts.ready.then(fit))
useEventListener('resize', useDebounceFn(fit, 150))
</script>

<style scoped>
.faq { margin-top: 40px; background: var(--lp-tint); border: 1px solid var(--lp-tint-line); border-radius: 20px; padding: 8px; }
.faq :deep(.faq-item) { border: 1px solid transparent; border-radius: 14px; padding-inline: 18px; transition: background-color .2s; }
.faq :deep(.faq-item[data-state="open"]) { background: var(--lp-raised); box-shadow: 0 1px 2px rgb(15 18 34 / .06); border-color: var(--lp-line); }
.faq :deep(.faq-q) { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 20px; padding-block: 16px; font: 600 17px/1.35 var(--lp-font-text); color: var(--lp-fg); cursor: pointer; text-align: start; }
.faq :deep(.faq-q:hover) { color: var(--lp-primary-ink); }
.faq :deep(.faq-c) { animation: none; }
.faq :deep(.faq-a) { color: var(--lp-muted); padding-bottom: 20px; max-width: 62ch; font-size: 16px; }
.pm { width: 28px; height: 28px; border-radius: 50%; background: var(--lp-tint-2); color: var(--lp-primary-ink); display: grid; place-items: center; flex: none; transition: transform .2s, background-color .2s; }
.pm.open { transform: rotate(45deg); background: var(--lp-primary); color: var(--lp-primary-fg); }
.faq :deep(code) { font: 500 .88em/1 var(--lp-font-mono); background: var(--lp-primary-soft); padding: 2px 6px; border-radius: 5px; color: var(--lp-primary-ink); }
</style>
