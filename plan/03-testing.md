# Component & Unit Testing Plan

## Goal
Introduce a testing strategy and initial test suite for GitVault using Vitest and Vue Test Utils, following the dual-project pattern from [`Evobaso-J/nuxt-starter`](https://github.com/Evobaso-J/nuxt-starter).

## Reference
The nuxt-starter repo establishes the testing pattern: two Vitest projects (`unit` and `nuxt`) with separate directories and environments.

---

## Step 1: Restructure Vitest config

Replace the current single-environment config with the nuxt-starter dual-project pattern.

**File:** `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
```

This gives us:
- **`test/unit/`** — Pure unit tests running in Node.js (fast, no Nuxt overhead)
- **`test/nuxt/`** — Component and integration tests running in the Nuxt environment (with auto-imports, composables, etc.)

## Step 2: Create test directory structure

```
test/
├── unit/
│   ├── config.test.ts
│   ├── resources/
│   │   ├── repoNameValidation.test.ts
│   │   └── zodSchemas.test.ts
│   └── utils/
│       ├── fileCategories.test.ts
│       └── uploadFile.test.ts
└── nuxt/
    ├── components/
    │   ├── RepoSelector.test.ts
    │   ├── FileCard.test.ts
    │   ├── FolderCard.test.ts
    │   ├── SearchBar.test.ts
    │   ├── FilePreview.test.ts
    │   ├── EmptySectionCard.test.ts
    │   └── LoginCard.test.ts
    └── composables/
        ├── useRepoStorage.test.ts
        ├── useUploadFile.test.ts
        └── useCreateRepo.test.ts
```

## Step 3: Update npm scripts

**File:** `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:nuxt": "vitest run --project nuxt"
  }
}
```

Remove the old `unit` and `unit:watch` scripts.

## Step 4: Unit tests — pure utility functions (highest priority)

These run in Node.js with no Nuxt context. Fast and straightforward.

### `test/unit/config.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { isFileExcluded } from '~/config'

describe('isFileExcluded', () => {
  it('excludes .gitkeep files', () => {
    expect(isFileExcluded('.gitkeep')).toBe(true)
  })
  it('does not exclude normal files', () => {
    expect(isFileExcluded('readme.md')).toBe(false)
  })
})
```

### `test/unit/resources/repoNameValidation.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

describe('isRepoNameValid', () => {
  it('accepts names with gitvault- prefix', () => {
    expect(isRepoNameValid('gitvault-my-files')).toBe(true)
  })
  it('rejects names without prefix', () => {
    expect(isRepoNameValid('my-repo')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isRepoNameValid('')).toBe(false)
  })
})
```

### `test/unit/resources/zodSchemas.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { repoSchemaPost } from '~~/server/resources/gitHubUserRepos'
import { fileSchemaPut } from '~~/server/resources/gitHubRepoContents'

describe('repoSchemaPost', () => {
  it('accepts valid repo creation payload', () => {
    expect(() => repoSchemaPost.parse({ name: 'gitvault-test', private: true })).not.toThrow()
  })
  it('rejects repo without prefix', () => {
    expect(() => repoSchemaPost.parse({ name: 'test', private: true })).toThrow()
  })
  it('rejects non-private repo', () => {
    expect(() => repoSchemaPost.parse({ name: 'gitvault-test', private: false })).toThrow()
  })
})

describe('fileSchemaPut', () => {
  it('accepts valid file upload payload', () => {
    expect(() => fileSchemaPut.parse({ content: 'base64data', message: 'upload' })).not.toThrow()
  })
  it('rejects missing content', () => {
    expect(() => fileSchemaPut.parse({ message: 'upload' })).toThrow()
  })
})
```

### `test/unit/utils/uploadFile.test.ts`
Test the pure helper functions (extracted or imported):
- `createFilePath(queryPath, fileName)` — empty path, nested path, root

## Step 5: Nuxt tests — composables

These run in the Nuxt environment with auto-imports available.

### `test/nuxt/composables/useRepoStorage.test.ts`
- Test `activeRepository` resets when repo no longer exists
- Test `isAnyRepoPresent` computed behavior
- Mock `useFetch` to return controlled data

### `test/nuxt/composables/useUploadFile.test.ts`
- Test file upload flow with mocked `$fetch`
- Test toast notification lifecycle (loading → success / error)
- Test replace mode (sha provided)

### `test/nuxt/composables/useCreateRepo.test.ts`
- Test repo creation with mocked API
- Test error handling and toast updates

## Step 6: Nuxt tests — components

Use `mountSuspended` from `@nuxt/test-utils/runtime` (nuxt-starter pattern):

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'
import MyComponent from '~/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', async () => {
    const wrapper = await mountSuspended(MyComponent, {
      props: { /* ... */ },
    })
    expect(wrapper.html()).toBeTruthy()
  })
})
```

### Priority components:
1. **`RepoSelector.vue`** — renders repo list, emits selection
2. **`FileCard/index.vue`** — renders file info, handles click
3. **`FolderCard.vue`** — renders folder info, handles navigation
4. **`SearchBar.vue`** — input handling, search events
5. **`FilePreview/index.vue`** — renders correct preview by file type
6. **`EmptySectionCard.vue`** — renders empty state
7. **`LoginCard/index.vue`** — renders login UI

## Step 7: CI integration

Already covered in `01-nuxt4-migration.md` (Step 10). The CI pipeline runs `pnpm test run` which executes both unit and nuxt test projects.

---

## Test priority order
1. Pure utility functions + Zod schemas (unit project — quick wins)
2. Composables (nuxt project — core business logic)
3. Components (nuxt project — UI behavior)

## Verification
```bash
pnpm test              # run all tests (both projects)
pnpm test:unit         # unit tests only
pnpm test:nuxt         # nuxt environment tests only
pnpm typecheck         # type checking still passes
```
