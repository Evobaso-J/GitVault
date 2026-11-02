// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module',
  ],
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/images/logo.svg' }],
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
  },

  runtimeConfig: {
    public: {
      ghDefaultBranch: 'main',
      // Absolute base for canonical/og URLs. Netlify's build-time URL is the production URL, also on previews.
      siteUrl: process.env.URL || 'http://localhost:3000',
    },
    oauth: {
      github: {
        clientId: '',
        clientSecret: '',
      },
    },
  },

  srcDir: 'src/',
  serverDir: 'server/',
  // `.claude/` holds agent worktrees: watching them exhausts file descriptors.
  ignore: ['.claude/**'],
  // Only the landing at `/` is server-rendered (prerendered at build); the app stays a client-only SPA.
  // `ssr: false` can't be global: a route rule can turn SSR off per route but not back on.
  routeRules: {
    '/**': { ssr: false },
    '/': { ssr: true, prerender: true },
    '/login': { redirect: '/vaults' },
  },

  experimental: {
    // Inline the landing's payload in its HTML. An extracted `/_payload.json` matches the `/**` ssr:false rule,
    // so it is prerendered as the SPA shell and the client fails to load it (NUXT_E7002).
    payloadExtraction: false,
  },
  compatibilityDate: '2026-10-30',

  typescript: {
    typeCheck: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
        noImplicitAny: true,
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
    checker: true,
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en-US',
    locales: [{ code: 'en-US', language: 'en-US' }],
  },

  image: {
    inject: true,
  },
})
