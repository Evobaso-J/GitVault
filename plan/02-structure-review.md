# Structure Review & Improvement Plan

## Goal
Reorganize the project to follow Nuxt 4 conventions and the patterns from [`Evobaso-J/nuxt-starter`](https://github.com/Evobaso-J/nuxt-starter). The main changes are renaming `src/` to `app/`, adopting the test directory structure, and aligning config files.

## Pre-requisites
- Do this **before** the Nuxt 4 migration (01-nuxt4-migration.md)

## Reference
Target structure based on nuxt-starter:
```
nuxt-starter/
├── app/
│   ├── app.vue
│   ├── assets/css/main.css
│   └── i18n/locales/en.json
├── test/
│   ├── unit/
│   └── nuxt/
├── server/
├── public/
├── nuxt.config.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
└── .github/workflows/ci.yml
```

---

## Step 1: Rename `src/` to `app/`

```bash
git mv src/ app/
```

### Update references

1. **`nuxt.config.ts`**: Remove `srcDir: 'src/'` (Nuxt 4 defaults to `app/`)
2. **`tailwind.config.js`**: Will be deleted entirely as part of the @nuxt/ui v3 migration. For now, update content paths from `./src/**/*.{js,vue,ts}` to `./app/**/*.{js,vue,ts}`
3. **Import aliases**: `~/` automatically points to `app/` — no code changes needed
4. **`~~/` alias**: Server imports using `~~/server/...` still work since `serverDir` is separate

## Step 2: Move locale files to match nuxt-starter convention

nuxt-starter places i18n locales at `app/i18n/locales/`:

```bash
mkdir -p app/i18n
git mv app/locales app/i18n/locales
```

Update the i18n config to point to the new location.

## Step 3: Add `app/assets/css/main.css`

Following nuxt-starter, create a main CSS entry point:

**File:** `app/assets/css/main.css`

```css
@import "tailwindcss";
@import "@nuxt/ui";
```

This will be used after the @nuxt/ui v3 migration. For now, create it with the existing Tailwind import if applicable, and register it in `nuxt.config.ts`:

```ts
css: ['~/assets/css/main.css'],
```

## Step 4: Create test directory structure

Move from co-located tests (none exist yet) to the nuxt-starter pattern:

```
test/
├── unit/          # Pure unit tests (Node.js environment)
└── nuxt/          # Component/integration tests (Nuxt environment)
```

```bash
mkdir -p test/unit test/nuxt
```

## Step 5: Review and improve component organization

Current structure is already reasonable, but group related components by feature domain:

Current:
```
app/components/
├── AppLogo.vue
├── AppToolbar.vue
├── UserMenu.vue
├── RepoSelector.vue
├── SearchBar.vue
├── CreateItemsDropdown.vue
├── CreateNamedResourceModal.vue
├── FileCard/
├── FilePreview/
├── FilesSection.vue
├── FoldersSection.vue
├── EmptySectionCard.vue
├── FolderCard.vue
├── LoginCard/
└── NoReposSetupWizard/
```

Proposed:
```
app/components/
├── App/
│   ├── Logo.vue
│   ├── Toolbar.vue
│   └── UserMenu.vue
├── Repo/
│   ├── Selector.vue
│   ├── SearchBar.vue
│   ├── CreateItemsDropdown.vue
│   ├── CreateNamedResourceModal.vue
│   ├── FilesSection.vue
│   ├── FoldersSection.vue
│   ├── EmptySectionCard.vue
│   └── FolderCard.vue
├── FileCard/
│   ├── index.vue
│   ├── Icon.vue
│   ├── Preview.vue
│   ├── Menu.vue
│   └── Header.vue
├── FilePreview/
│   ├── index.vue
│   ├── Code.vue
│   ├── Video.vue
│   ├── Text.vue
│   ├── Image.vue
│   ├── Pdf.vue
│   └── Fallback.vue
├── Login/
│   ├── Card.vue
│   └── CanvasPattern.vue
└── SetupWizard/
    ├── index.vue
    ├── Step1.vue
    ├── Step2.vue
    └── Step3.vue
```

Nuxt auto-imports by directory path, so `App/Logo.vue` becomes `<AppLogo />` — no template changes needed if directory names match the current prefixes.

## Step 6: Review server structure

Current server structure is clean — no changes needed:
```
server/
├── routes/
│   ├── auth/github.get.ts
│   ├── gh-user-repos/
│   ├── gh-repo-contents/
│   └── gh-repo-tree/
├── resources/
└── auth.d.ts
```

## Step 7: Clean up config and utility files

1. **Merge `app/helpers.ts`** → move into `app/utils/` if it only contains utility types/functions
2. **Move `app/errors.ts`** → `app/utils/errors.ts`
3. **Keep `app/config.ts`** — contains app-wide constants

## Step 8: Add VS Code settings

Following nuxt-starter, add `.vscode/settings.json` and `.vscode/extensions.json` for consistent DX:

**`.vscode/extensions.json`:**
```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "nuxtr.nuxtr-vscode"
  ],
  "unwantedRecommendations": [
    "esbenp.prettier-vscode"
  ]
}
```

**`.vscode/settings.json`:** Tailwind CSS language mode, ESLint auto-fix on save, i18n locale path, file nesting.

## Step 9: Verify everything works

```bash
pnpm run postinstall   # nuxt prepare (regenerates .nuxt/)
pnpm run typecheck
pnpm run lint:fix       # fix any import path issues
pnpm run build
pnpm run dev            # manual smoke test
```

---

## Key principle
Keep changes minimal and mechanical. The goal is convention alignment, not a full rewrite.
