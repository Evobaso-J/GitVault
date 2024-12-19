// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n', '@nuxt/image'],

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
  ssr: true,
  compatibilityDate: '2024-07-04',

  runtimeConfig: {
    ghToken: '',
    ghRepoOwner: '',
    ghRepoName: '',
    ghDefaultBranch: 'main',
  },
})
