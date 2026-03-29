# @nuxt/ui v2 → v3 Migration Plan

## Goal
Migrate from `@nuxt/ui v2.18.4` to `@nuxt/ui v3` (target: v4.4.0, matching [`Evobaso-J/nuxt-starter`](https://github.com/Evobaso-J/nuxt-starter)), which brings Tailwind CSS v4, Radix Vue, and a completely new component API.

## Pre-requisites
- Complete **01-nuxt4-migration.md** first (Nuxt 4 is required for @nuxt/ui v3)
- Complete **02-structure-review.md** first (clean structure)

## Reference
nuxt-starter uses `@nuxt/ui: 4.4.0` with `tailwindcss: ^4.2.1` and CSS-based config via `app/assets/css/main.css`.

---

## Key differences in @nuxt/ui v3+
- **Tailwind CSS v4** (CSS-based config instead of JS config)
- **Radix Vue** replaces Headless UI as the underlying primitive library
- **New component API** — props, slots, and events may differ
- **New theming system** — uses CSS variables and `app.config.ts` instead of `ui` prop overrides
- **Some components renamed or restructured**

## Step 1: Update dependencies

**File:** `package.json`

```bash
pnpm remove @nuxt/ui @iconify-json/heroicons
pnpm add @nuxt/ui@4.4.0 tailwindcss@^4.2.1
```

This installs Tailwind CSS v4 alongside @nuxt/ui v4.

## Step 2: Replace `tailwind.config.js` with CSS config

Delete `tailwind.config.js` and use the nuxt-starter CSS pattern:

**File:** `app/assets/css/main.css`
```css
@import "tailwindcss";
@import "@nuxt/ui";
```

Register in `nuxt.config.ts`:
```ts
css: ['~/assets/css/main.css'],
```

## Step 3: Update `nuxt.config.ts`

- Remove `colorMode` config (handled differently in v3+)
- Remove any `ui`-specific config from Nuxt config
- Update module registration (just `@nuxt/ui` — same name)

## Step 4: Migrate component usage

This is the bulk of the work. Each component using @nuxt/ui must be reviewed.

### Components using @nuxt/ui (identified from codebase):

| Component | UI Components Used | Migration Notes |
|-----------|-------------------|-----------------|
| `AppToolbar.vue` | Layout/container elements | Review structure |
| `UserMenu.vue` | `UDropdown`, `UAvatar`, `UButton` | `UDropdown` → `UDropdownMenu` |
| `RepoSelector.vue` | `USelectMenu` or similar | May be renamed to `USelect` |
| `SearchBar.vue` | `UInput` | Check props |
| `CreateItemsDropdown.vue` | `UDropdown`, `UButton` | `UDropdown` → `UDropdownMenu` |
| `CreateNamedResourceModal.vue` | `UModal`, `UInput`, `UButton` | `v-model` → `v-model:open` |
| `FileCard/Menu.vue` | `UDropdown` | `UDropdown` → `UDropdownMenu` |
| `EmptySectionCard.vue` | `UCard` or layout | Check props |
| `LoginCard/index.vue` | `UButton`, `UCard` | Check props |
| `NoReposSetupWizard/*.vue` | Various UI components | Review each step |

### Common migration patterns:

#### UDropdown → UDropdownMenu
```vue
<!-- v2 -->
<UDropdown :items="items" :popper="{ placement: 'bottom-start' }">

<!-- v3+ — uses Radix Vue positioning -->
<UDropdownMenu :items="items">
```

#### UModal
```vue
<!-- v2 -->
<UModal v-model="isOpen">

<!-- v3+ -->
<UModal v-model:open="isOpen">
```

#### Toast (useToast)
```ts
// v2
const toast = useToast()
toast.add({ id, title, color: 'green', icon: '...' })
toast.update(id, { ... })

// v3+ — verify toast API; may use different notification pattern
```

**Critical:** Toast is used heavily in `useUploadFile.ts`, `useCreateRepo.ts`, and `useCreateFolder.ts`. These composables use `toast.add()` with custom IDs and then `toast.update()` for progress tracking. This pattern must be carefully migrated.

## Step 5: Update `ui` prop overrides

In v2, components accept a `ui` prop for customization:
```vue
<UNotification :ui="{ icon: { base: 'animate-spin' } }" />
```

In v3+, customization uses CSS variables and `app.config.ts`. Review all `ui` prop usages and migrate to the new theming approach.

## Step 6: Update icon usage

Review all icon strings. v3+ may change how icons are referenced:
- `i-mdi-loading`
- `i-mdi-check`
- `i-mdi-alert-outline`
- `i-heroicons-*`
- `i-material-symbols-*`

Ensure icon packages are compatible.

## Step 7: Update color mode

v2 uses `colorMode` in nuxt.config:
```ts
colorMode: { preference: 'light' }
```

v3+ handles this differently. Update accordingly.

## Step 8: Test thoroughly

```bash
pnpm run build
pnpm run dev
```

### Visual regression checklist:
- [ ] Login page renders correctly
- [ ] Toolbar and navigation look correct
- [ ] Repo selector dropdown works
- [ ] File cards display properly
- [ ] File preview modal works
- [ ] Create repo/folder modals work
- [ ] Toast notifications appear and animate
- [ ] Setup wizard steps render correctly
- [ ] Responsive layout works
- [ ] Dark/light mode (if applicable)

---

## Risks
- **High effort**: Nearly every component uses @nuxt/ui — this is a significant migration
- **Toast system**: Custom toast usage (with `update`, `ui` overrides) may need rethinking
- **Tailwind v4**: Class names and utilities may have subtle differences
- **No gradual migration path**: v2 and v3+ cannot coexist — this is a big-bang change

## Recommendation
Do this migration on a dedicated branch with a full visual review before merging.
