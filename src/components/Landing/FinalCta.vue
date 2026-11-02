<template>
  <div class="final">
    <LandingLogo class="mark" />
    <div class="wrap">
      <h2>{{ $t('landing.final.title') }}</h2>
      <LandingCta
        size="lg"
        on-deep
      />
    </div>
  </div>
</template>

<style scoped>
.final { background: linear-gradient(135deg, var(--lp-deep), var(--lp-deep-2)); color: var(--lp-on-deep); position: relative; overflow: hidden; }
.wrap { padding-block: 104px; position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 28px; }
h2 { font-size: clamp(32px, 4.6vw, 52px); line-height: 1.05; font-weight: 600; letter-spacing: -0.03em; max-width: 15ch; }
.mark { position: absolute; right: -40px; bottom: -70px; width: 340px; height: 340px; color: var(--lp-on-deep-line); opacity: .55; }
.final :focus-visible { outline-color: var(--lp-on-deep); }
</style>
