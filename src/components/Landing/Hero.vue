<template>
  <div class="hero">
    <div class="wrap">
      <div class="hero-top">
        <h1>
          <span class="sr-only">{{ $t('landing.hero.srTitle') }}</span>
          <span aria-hidden="true">
            <span class="ln">{{ $t('landing.hero.line1') }}</span>
            <span class="ln nw">{{ $t('landing.hero.line2') }} <LandingWordRotator /></span>
            <span class="ln">{{ $t('landing.hero.line3') }}</span>
          </span>
        </h1>
        <div class="hero-side">
          <p class="lede">
            {{ $t('landing.hero.lede') }}
          </p>
          <div class="cta-row">
            <LandingCta size="lg" />
            <p class="micro">
              {{ $t('landing.hero.accountRequired') }}<br>{{ $t('landing.hero.noAccount') }}
              <a
                href="https://github.com/signup"
                target="_blank"
                rel="noopener"
              >{{ $t('landing.hero.createAccount') }} <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </div>
      </div>

      <div class="stage">
        <LandingAppMock />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero { padding-block: 72px 0; overflow-x: clip; }
.hero-top { display: grid; gap: 28px; align-items: end; }
.hero h1 { font-size: clamp(30px, 8.4vw, 58px); line-height: 1.04; letter-spacing: -0.035em; font-weight: 600; }
.ln { display: block; }
.nw { white-space: nowrap; }
@media (min-width: 900px) {
  .hero-top { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 56px; }
  .hero h1 { font-size: min(58px, 5vw); }
}
.hero-side { display: grid; gap: 24px; min-width: 0; }
.lede { font-size: clamp(17px, 1.6vw, 19px); color: var(--lp-muted); max-width: 46ch; }
.cta-row { display: grid; gap: 12px; justify-items: start; }
.micro { font-size: 14px; color: var(--lp-muted); }
.micro a { color: var(--lp-fg); font-weight: 500; white-space: nowrap; text-decoration: underline; text-decoration-color: var(--lp-line); text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
.micro a:hover { text-decoration-color: var(--lp-primary); }

.stage { margin-top: 56px; position: relative; padding-bottom: 40px; }
.stage::before { content: ""; position: absolute; inset: 48px calc(50% - 50vw) 0; z-index: -1; background: linear-gradient(var(--lp-surface), var(--lp-bg)); border-top: 1px solid var(--lp-line); }

/* Wide screens: headline + CTA on the left, the app mock beside it on the right. */
@media (min-width: 1200px) {
  .hero { padding-block: 64px 32px; }
  .hero > .wrap { max-width: 1400px; display: grid; grid-template-columns: minmax(0, 440px) minmax(0, 1fr); gap: 56px; align-items: center; }
  .hero-top { grid-template-columns: 1fr; gap: 28px; align-items: start; }
  .hero h1 { font-size: clamp(40px, 3.3vw, 50px); }
  .stage { margin-top: 0; padding-bottom: 0; }
  .stage::before { display: none; }
}
</style>
