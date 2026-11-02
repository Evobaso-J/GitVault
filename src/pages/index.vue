<template>
  <div class="lp">
    <header class="site-header">
      <div class="wrap">
        <a
          class="wordmark"
          href="#top"
          :aria-label="$t('landing.nav.home')"
        ><LandingLogo class="logo size-[26px]" />{{ $t('app.name') }}</a>
        <nav
          class="nav"
          :aria-label="$t('landing.nav.label')"
        >
          <a href="#how">{{ $t('landing.nav.how') }}</a>
          <a href="#faq">{{ $t('landing.nav.faq') }}</a>
        </nav>
        <LandingCta size="sm" />
      </div>
    </header>

    <main id="top">
      <LandingHero />
      <LandingHowItWorks />

      <div class="statement">
        <div class="wrap">
          <p>
            {{ $t('landing.features.lead') }}
            <template
              v-for="(item, index) in FEATURES"
              :key="item"
            >
              <mark>{{ $t(`landing.features.items.${item}`) }}</mark>{{ index < FEATURES.length - 1 ? ', ' : '. ' }}
            </template>
            <span>{{ $t('landing.features.devices') }}</span>
          </p>
        </div>
      </div>

      <LandingWhySwitcher />
      <LandingFaq />
      <LandingFinalCta />
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <a
          href="https://github.com/Evobaso-J/GitVault"
          target="_blank"
          rel="noopener"
        ><UIcon
          name="i-simple-icons-github"
          class="ic-sm"
        />{{ $t('landing.footer.source') }}</a>
        <span>{{ $t('landing.footer.copyright', { year: YEAR }) }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Public landing: the only server-rendered page (prerendered, see routeRules). No auth middleware, no app layout.
// Everything here must be SSR-safe: browser-only code runs in onMounted.
definePageMeta({ layout: false })

const FEATURES = ['folders', 'uploads', 'previews', 'downloads'] as const
// Build year from the prerender payload, so hydration never sees a different year than the static HTML.
const YEAR = useState('landing-year', () => new Date().getFullYear())

const { t } = useI18n()
const siteUrl = useRuntimeConfig().public.siteUrl
const url = new URL('/', siteUrl).href
const image = new URL('/images/og.png', siteUrl).href
const title = t('landing.meta.title')
const description = t('landing.meta.description')

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: t('app.name'),
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  ogLocale: 'en_US',
  ogImage: image,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: t('landing.meta.ogImageAlt'),
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  twitterImageAlt: t('landing.meta.ogImageAlt'),
})

useHead({
  // The title already names the brand: skip the app-wide "%s • GitVault" template.
  titleTemplate: null,
  link: [{ rel: 'canonical', href: url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': t('app.name'),
      url,
      description,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'Web',
      'isAccessibleForFree': true,
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
    }),
  }],
})
</script>

<style>
/* Landing design tokens (prototype "Clean" direction). The app forces light mode; the landing follows the system theme.
   Mapped onto the app's royal-blue scale where the values match; the rest are landing-only. */
:root:has(.lp) {
  --lp-bg: #fff;
  --lp-fg: #0f1222;
  --lp-muted: #5b6075;
  --lp-subtle: #6b7086;
  --lp-line: #e6e8ef;
  --lp-primary: var(--color-royal-blue-600);
  --lp-primary-fg: #fff;
  --lp-primary-soft: var(--color-royal-blue-100);
  --lp-primary-ink: var(--color-royal-blue-700);
  --lp-primary-line: var(--color-royal-blue-200);
  --lp-surface: #f6f7fa;
  --lp-surface-2: #eef0f5;
  --lp-raised: #fff;
  --lp-error: #dc2626;
  --lp-ok: #16a34a;
  --lp-logo: var(--color-royal-blue-500);
  --lp-sky: #9cc3f0;
  --lp-sea: #3d7fd6;
  --lp-sand: #f2d39b;
  --lp-sun: #ffcf8b;
  --lp-header-bg: rgb(255 255 255 / 0.85);
  --lp-shadow: 0 1px 2px rgb(15 18 34 / 0.04), 0 24px 60px -20px rgb(15 18 34 / 0.18);
  --lp-shadow-lg: 0 10px 30px -8px rgb(15 18 34 / 0.25);
  --lp-tint: var(--color-royal-blue-50);
  --lp-tint-2: var(--color-royal-blue-100);
  --lp-tint-line: var(--color-royal-blue-200);
  --lp-tint-dot: var(--color-royal-blue-200);
  --lp-deep: var(--color-royal-blue-900);
  --lp-deep-2: var(--color-royal-blue-950);
  --lp-on-deep: #fff;
  --lp-on-deep-muted: var(--color-royal-blue-200);
  --lp-on-deep-line: var(--color-royal-blue-700);
  --lp-accent-bg: #ffe7b3;
  --lp-accent-ink: #7a4300;
  --lp-accent: #f59e0b;
  --lp-gh-btn: #0f1222;
  --lp-gh-btn-fg: #fff;
  --lp-font-text: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --lp-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  scroll-behavior: smooth;
  scroll-padding-top: 72px;
}
@media (prefers-color-scheme: dark) {
  :root:has(.lp) {
    --lp-bg: #0c0d14;
    --lp-fg: #eceef6;
    --lp-muted: #a0a5b9;
    --lp-subtle: #8a8fa3;
    --lp-line: #23263a;
    --lp-primary: var(--color-royal-blue-400);
    --lp-primary-fg: #0c0d14;
    --lp-primary-soft: #1e1f4a;
    --lp-primary-ink: var(--color-royal-blue-200);
    --lp-primary-line: #34378a;
    --lp-surface: #12141e;
    --lp-surface-2: #1a1d2b;
    --lp-raised: #151826;
    --lp-error: #f87171;
    --lp-ok: #4ade80;
    --lp-logo: var(--color-royal-blue-400);
    --lp-sky: #3b5f8f;
    --lp-sea: #2a5ea8;
    --lp-sand: #a88b5a;
    --lp-sun: #e0b26a;
    --lp-header-bg: rgb(12 13 20 / 0.82);
    --lp-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 24px 60px -20px rgb(0 0 0 / 0.7);
    --lp-shadow-lg: 0 10px 30px -8px rgb(0 0 0 / 0.7);
    --lp-tint: #10122a;
    --lp-tint-2: #181b3d;
    --lp-tint-line: #2c3070;
    --lp-tint-dot: #262a62;
    --lp-deep: var(--color-royal-blue-950);
    --lp-deep-2: #0f0c30;
    --lp-on-deep: var(--color-royal-blue-50);
    --lp-on-deep-line: var(--color-royal-blue-800);
    --lp-accent-bg: #4a3108;
    --lp-accent-ink: #ffd58a;
    --lp-accent: #fbbf24;
    --lp-gh-btn: #eceef6;
    --lp-gh-btn-fg: #0c0d14;
    color-scheme: dark;
  }
}
@media (prefers-reduced-motion: reduce) {
  :root:has(.lp) { scroll-behavior: auto; }
  .lp *, .lp *::before, .lp *::after { transition: none !important; animation: none !important; }
}
body:has(.lp) { background: var(--lp-bg); }

.lp { background: var(--lp-bg); color: var(--lp-fg); font: 400 16px/1.6 var(--lp-font-text); -webkit-font-smoothing: antialiased; overflow-x: clip; }
.lp h1, .lp h2, .lp h3 { font-family: "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif; text-wrap: balance; letter-spacing: -0.02em; }
.lp a { color: inherit; }
.lp :focus-visible { outline: 2px solid var(--lp-primary); outline-offset: 3px; border-radius: 6px; }
.lp .ic { width: 20px; height: 20px; flex: none; }
.lp .ic-sm { width: 16px; height: 16px; flex: none; }

.lp .wrap { max-width: 1120px; margin-inline: auto; padding-inline: 16px; }
@media (min-width: 720px) { .lp .wrap { padding-inline: 32px; } }

/* buttons: UButton restyled to the prototype */
.lp .lp-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding-block: 0; padding-inline: 18px; border-radius: 10px; font: 600 15px/1 var(--lp-font-text); white-space: nowrap; transition: background-color .15s, transform .15s; }
.lp .lp-btn:active { transform: translateY(1px); }
.lp .lp-btn-sm { min-height: 36px; padding-inline: 14px; font-size: 14px; border-radius: 8px; gap: 8px; }
.lp .lp-btn-lg { min-height: 52px; padding-inline: 22px; font-size: 16px; border-radius: 12px; }
.lp .lp-btn-primary { background: var(--lp-primary); color: var(--lp-primary-fg); }
.lp .lp-btn-primary:hover { background: var(--lp-primary-ink); }
@media (prefers-color-scheme: dark) { .lp .lp-btn-primary:hover { color: var(--lp-bg); } }
.lp .lp-btn-on-deep { background: var(--lp-on-deep); color: var(--lp-deep-2); }
.lp .lp-btn-on-deep:hover { background: var(--lp-on-deep-muted); }

/* header */
.lp .site-header { position: sticky; top: 0; z-index: 20; background: var(--lp-header-bg); backdrop-filter: saturate(1.6) blur(14px); border-bottom: 1px solid var(--lp-line); }
.lp .site-header .wrap { display: flex; align-items: center; gap: 24px; height: 64px; }
.lp .wordmark { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font: 700 18px/1 var(--lp-font-text); letter-spacing: -0.01em; }
.lp .logo { color: var(--lp-logo); flex: none; }
.lp .nav { display: flex; gap: 4px; margin-left: auto; }
.lp .nav a { text-decoration: none; color: var(--lp-muted); font-size: 14px; font-weight: 500; padding: 8px 12px; border-radius: 8px; }
.lp .nav a:hover { color: var(--lp-fg); background: var(--lp-surface); }
@media (max-width: 560px) { .lp .nav { display: none; } .lp .site-header .lp-btn { margin-left: auto; } }
@media (min-width: 1200px) { .lp .site-header .wrap { max-width: 1400px; } }

/* shared section atoms */
.lp .band { padding-block: 104px; }
.lp .band-tint { background: var(--lp-tint); border-block: 1px solid var(--lp-line); }
.lp .h2 { font-size: clamp(30px, 4vw, 44px); line-height: 1.08; font-weight: 600; letter-spacing: -0.03em; }
.lp .muted { color: var(--lp-muted); }

/* shared mock atoms (How it works, Why GitVault) */
.lp .viz { background: var(--lp-tint-2); border: 1px solid var(--lp-tint-line); border-radius: 18px; padding: 28px 22px; display: grid; place-items: center; position: relative; overflow: hidden; min-width: 0;
  background-image: radial-gradient(var(--lp-tint-dot) 1px, transparent 1.2px); background-size: 16px 16px; }
.lp .mock { width: 100%; max-width: 300px; background: var(--lp-raised); border: 1px solid var(--lp-line); border-radius: 12px; box-shadow: var(--lp-shadow-lg); font: 400 13px/1.4 var(--lp-font-text); position: relative; }
.lp .mock-h { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--lp-line); font-weight: 600; font-size: 14px; }
.lp .mock-h .x { margin-left: auto; color: var(--lp-muted); }
.lp .mock-b { padding: 14px; display: grid; gap: 10px; }
.lp .mbtn { height: 32px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding-inline: 12px; font-weight: 600; font-size: 13px; white-space: nowrap; }
.lp .mbtn.gh { background: var(--lp-gh-btn); color: var(--lp-gh-btn-fg); }
.lp .mbtn.solid { background: var(--lp-primary); color: var(--lp-primary-fg); }
.lp .mbtn.outlined { border: 1px solid var(--lp-primary-line); color: var(--lp-primary-ink); background: var(--lp-raised); }
.lp .side-label { font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--lp-muted); padding: 2px 10px 6px; }
.lp .nav-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; color: var(--lp-muted); font-weight: 500; }

/* features line */
.lp .statement { padding-block: 96px; }
.lp .statement p { font: 500 clamp(24px, 3.2vw, 36px)/1.3 "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.025em; max-width: 30ch; text-wrap: balance; }
.lp .statement mark { color: inherit; background: linear-gradient(transparent 58%, var(--lp-tint-line) 58% 92%, transparent 92%); padding-inline: 2px; }
.lp .statement p span { color: var(--lp-subtle); }

/* footer */
.lp .site-footer { background: var(--lp-deep-2); color: var(--lp-on-deep-muted); }
.lp .site-footer .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-block: 24px; font-size: 14px; border-top: 1px solid var(--lp-on-deep-line); }
.lp .site-footer a { text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
.lp .site-footer a:hover { color: var(--lp-on-deep); }
.lp .site-footer :focus-visible { outline-color: var(--lp-on-deep); }
</style>
