// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module',
  ],

  image: {
    inject: true,
  },

  eslint: {
    config: {
      stylistic: true,
    },
    checker: true,
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  srcDir: 'src/',
  serverDir: 'server/',
  ssr: false,
  compatibilityDate: '2024-07-04',

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

  colorMode: {
    preference: 'light',
  },
})
