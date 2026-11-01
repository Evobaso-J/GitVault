import { configDefaults } from 'vitest/config'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Agent worktrees are full repo copies with their own tests
    exclude: [...configDefaults.exclude, '.claude/**'],
    typecheck: {
      enabled: true,
      include: ['**/*test.ts'],
      ignoreSourceErrors: true,
    },
    environment: 'nuxt',
  },
})
