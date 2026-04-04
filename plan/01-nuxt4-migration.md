# Nuxt 4 Migration Plan

## Goal

Migrate GitVault from Nuxt 3.12.1 to Nuxt 4, following the patterns established in [`Evobaso-J/nuxt-starter`](https://github.com/Evobaso-J/nuxt-starter).

## Pre-requisites

- Complete **02-structure-review.md** first (src/ → app/ rename)
- All existing functionality must keep working after migration

## Reference

The nuxt-starter repo at `Evobaso-J/nuxt-starter` serves as the target configuration baseline.

---

## Steps

1. [Update core dependencies](./01-nuxt4-migration/step-01-update-core-dependencies.md)
2. [Update Nuxt modules](./01-nuxt4-migration/step-02-update-nuxt-modules.md)
3. [Update `nuxt.config.ts`](./01-nuxt4-migration/step-03-update-nuxt-config.md)
4. [Update TypeScript config](./01-nuxt4-migration/step-04-update-tsconfig.md)
5. [Update ESLint config](./01-nuxt4-migration/step-05-update-eslint-config.md)
6. [Update i18n setup](./01-nuxt4-migration/step-06-update-i18n.md)
7. [Review breaking changes in composables](./01-nuxt4-migration/step-07-review-composables.md)
8. [Add npm scripts](./01-nuxt4-migration/step-08-add-npm-scripts.md)
9. [Add Husky pre-push hook](./01-nuxt4-migration/step-09-add-husky.md)
10. [Add CI pipeline](./01-nuxt4-migration/step-10-add-ci-pipeline.md)
11. [Build and test](./01-nuxt4-migration/step-11-build-and-test.md)

---

## Risks

- **@nuxtjs/i18n v10**: Significant breaking changes from v8 — config format, locale loading, and type-safe schema all need review
- **nuxt-auth-utils**: OAuth flow may need adjustments for Nuxt 4
- **@nuxt/ui v2 on Nuxt 4**: May have compatibility issues (addressed separately in 04-nuxt-ui-v3-migration.md)
- **Node.js 23.6+**: Stricter engine requirement — ensure dev/CI environments are updated
