# Nuxt 4 Migration Plan

## Goal
Migrate GitVault from Nuxt 3.12.1 to Nuxt 4, following the patterns established in [`Evobaso-J/nuxt-starter`](https://github.com/Evobaso-J/nuxt-starter).

## Pre-requisites
- Complete **02-structure-review.md** first (src/ → app/ rename)
- All existing functionality must keep working after migration

## Reference
The nuxt-starter repo at `Evobaso-J/nuxt-starter` serves as the target configuration baseline.

---

## Step 1: Update core dependencies

**File:** `package.json`

Align versions with nuxt-starter:

| Package | Current | Target (from nuxt-starter) |
|---------|---------|----------------------------|
| `nuxt` | ^3.12.1 | ^4.3.1 |
| `vue` | ^3.4.21 | ^3.5.28 |
| `vue-router` | (implicit) | ^4.6.4 (add explicitly) |
| `typescript` | 5.4.4 | ^5.9.3 |
| `vue-tsc` | ^1 | ^3.2.5 |
| `vitest` | ^3.0.9 | ^4.0.18 |
| `@nuxt/test-utils` | ^3.17.2 | ^4.0.0 |
| `eslint` | (implicit) | ^10.0.1 (add explicitly) |
| `happy-dom` | ^17.0.2 | ^20.7.0 |

Also add:
- `playwright-core`: ^1.58.2 (needed by @nuxt/test-utils v4)
- `husky`: ^9.1.7 (git hooks — pre-push runs lint + typecheck)

```bash
pnpm add nuxt@^4.3.1 vue@^3.5.28 vue-router@^4.6.4
pnpm add -D typescript@^5.9.3 vue-tsc@^3.2.5 vitest@^4.0.18 @nuxt/test-utils@^4.0.0 happy-dom@^20.7.0 playwright-core@^1.58.2 eslint@^10.0.1 husky@^9.1.7
```

Update `packageManager` field:
```json
"packageManager": "pnpm@10.29.2"
```

Add engine constraints (matching nuxt-starter):
```json
"engines": {
  "node": ">=23.6.0"
},
"engineStrict": true
```

## Step 2: Update Nuxt modules

| Module | Current | Target |
|--------|---------|--------|
| `@nuxt/eslint` | ^0.3.13 | 1.14.0 |
| `@nuxtjs/i18n` | ^8.5.3 | 10.2.3 |
| `@nuxt/image` | ^1.8.1 | latest (keep) |
| `nuxt-auth-utils` | 0.5.10 | latest (check Nuxt 4 compat) |

```bash
pnpm add @nuxt/eslint@1.14.0 @nuxtjs/i18n@10.2.3
pnpm update @nuxt/image nuxt-auth-utils
```

## Step 3: Update `nuxt.config.ts`

Align with nuxt-starter pattern:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-02-21',

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@nuxt/test-utils/module',
  ],

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  typescript: {
    typeCheck: true,
  },

  // i18n config moves inline (nuxt-starter pattern)
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
    ],
    defaultLocale: 'en',
  },

  eslint: {
    // config here
  },

  // Remove srcDir (app/ is the Nuxt 4 default)
  // Remove serverDir (server/ is the default)
  serverDir: 'server/',
  ssr: false,

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

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
```

Key changes:
- Remove `srcDir: 'src/'`
- Set `compatibilityDate: '2026-02-21'`
- Add `css: ['~/assets/css/main.css']`
- Inline i18n config (nuxt-starter uses inline `locales` array instead of separate config file)

## Step 4: Update TypeScript config

**File:** `tsconfig.json`

Replace with Nuxt 4 project references pattern (from nuxt-starter):

```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

This replaces the old `extends: "./.nuxt/tsconfig.json"` pattern. Strict options (`noImplicitAny`, `noUncheckedIndexedAccess`) will need to be added to the Nuxt config or a separate override.

## Step 5: Update ESLint config

**File:** `eslint.config.mjs`

Align with nuxt-starter:

```js
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
)
```

## Step 6: Update i18n setup

`@nuxtjs/i18n` v10 has breaking changes from v8:

- Move locale files from `app/locales/` to `app/i18n/locales/` (nuxt-starter convention)
- Update i18n config format — v10 uses inline config in `nuxt.config.ts` with `locales` array
- Remove the separate `i18n.config.ts` file if it exists, or update it to v10 format
- Verify `defineI18nConfig` and type-safe schema still work

## Step 7: Review breaking changes in composables

### `useFetch` / `$fetch`
- Nuxt 4 may change default `dedupe` behavior
- Review: `app/composables/useRepoStorage.ts` (line 16)

### `useRoute` / `useRouter`
- Verify route param typing in:
  - `app/composables/useUploadFile.ts` (line 36)
  - `app/middleware/03.active-repo.ts`

### `defineNuxtRouteMiddleware`
- Check if renamed/changed in Nuxt 4
- Files: all 4 middleware files under `app/middleware/`

## Step 8: Add npm scripts

Align scripts with nuxt-starter:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "nuxt typecheck",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:nuxt": "vitest run --project nuxt",
    "prepare": "husky"
  }
}
```

## Step 9: Add Husky pre-push hook

**File:** `.husky/pre-push`

```bash
pnpm lint && pnpm typecheck
```

## Step 10: Add CI pipeline

**File:** `.github/workflows/ci.yml`

Follow nuxt-starter's 3-job pattern:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx nuxt typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test run
```

## Step 11: Build and test

```bash
pnpm install
pnpm run postinstall   # nuxt prepare
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run dev           # manual smoke test
```

### Manual smoke test checklist:
- [ ] Login via GitHub OAuth works
- [ ] Repo list loads correctly
- [ ] Can navigate into a repo and browse files/folders
- [ ] File preview works (image, code, PDF)
- [ ] File upload works
- [ ] Folder creation works
- [ ] Repo creation works
- [ ] Page transitions work
- [ ] i18n translations load correctly

---

## Risks
- **@nuxtjs/i18n v10**: Significant breaking changes from v8 — config format, locale loading, and type-safe schema all need review
- **nuxt-auth-utils**: OAuth flow may need adjustments for Nuxt 4
- **@nuxt/ui v2 on Nuxt 4**: May have compatibility issues (addressed separately in 04-nuxt-ui-v3-migration.md)
- **Node.js 23.6+**: Stricter engine requirement — ensure dev/CI environments are updated
