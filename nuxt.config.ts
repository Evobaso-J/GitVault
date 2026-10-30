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
  ssr: false,
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
  },

  runtimeConfig: {
    public: {
      ghDefaultBranch: 'main',
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
