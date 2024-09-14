// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n'],
  eslint: {
    config: {
      stylistic: true,
    },
    checker: true,
  },

  srcDir: 'src/',
  ssr: true,
  compatibilityDate: '2024-07-04',
})
