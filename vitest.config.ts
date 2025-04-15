import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    typecheck: {
      enabled: true,
      include: ['**/*test.ts'],
      ignoreSourceErrors: true,
    },
    environment: 'nuxt',
  },
})
