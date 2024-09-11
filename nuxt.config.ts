// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  modules: ['@nuxt/eslint'],

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
