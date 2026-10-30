<!-- purpose: System shape, entry points, and module layout. Read this first to understand how the codebase is organized. -->
# Architecture

<!-- exodia:section:intro -->
Client-only Nuxt 4 SPA that uses the user's own GitHub repos (prefixed `gitvault-`) as file storage. The Nitro server is a thin authenticated proxy to the GitHub REST API.

## Entry Points & Routing

<!-- exodia:section:routing -->
File-based Nuxt routing under `src/pages/` (`srcDir` in `nuxt.config.ts`).

- `index.vue`: repo picker / no-repo setup wizard.
- `login.vue`: GitHub OAuth entry.
- `[repo]/[...path].vue`: folder listing (folders + files) of the active repo. `?file=<name>` opens that file in the preview panel beside the list, so the URL is a deep link to it. The folder fetch is not awaited: the page shows `FolderContents/Loading`, `Error` (404 vs other, with retry) or `Empty` instead of a blank page.
- `[repo]/file/[...path].vue`: single-file preview.
- Build links to these pages with `getPathToFolder` / `getPathToFile` (`src/resources/CDNFiles/utils.ts`), never by string concatenation: file names may contain `#`, `?` or `%`, which must be encoded per path segment.

Route middleware in `src/middleware/` is **named, not global**: pages opt in via `definePageMeta({ middleware: [...] })`. Numeric prefixes only order files (`00.auth`, `01.guest`, `03.active-repo`, `04.no-active-repo`).

Server routes live in `server/routes/` with no `/api` prefix: `gh-repo-contents` (GET/PUT), `gh-repo-tree` (GET), `gh-user-repos` (GET/POST), `auth/github` (GET).

### Key Files

- `nuxt.config.ts`
- `src/pages/[repo]/[...path].vue`
- `src/middleware/03.active-repo.ts`
- `server/routes/gh-repo-contents/index.put.ts`

## Modules & Boundaries

<!-- exodia:section:modules -->
- `src/pages/`, `src/layouts/` (`default`, `no-repo`, `single-file`): views.
- `src/components/`: flat files plus feature folders (`FolderContents/` list + preview panel, `FilePreview/`, `LoginCard/`, `NoReposSetupWizard/`).
- `src/resources/<Entity>/`: client domain per entity. `index.ts` types, `parse.ts` GitHub → domain narrowing, `utils.ts` helpers.
- `src/composables/`: stateful logic and mutations (`useVaultContents`, `useCreateRepo`, `useRepoStorage`, `useRouteQueryPath`).
- `server/routes/`: GitHub proxy handlers. `server/utils/github.ts`: the only GitHub caller. `server/resources/`: Octokit-derived types + zod request schemas.
- `shared/types/auth.d.ts`: session typing for `nuxt-auth-utils`, used by both sides.
- `src/config.ts` (app constants), `src/errors.ts` (error classes), `src/helpers.ts` (type helpers), `i18n/` + `src/locales/`.

Boundary: client imports server types type-only via `~~/server/resources/*`.

## State Management

<!-- exodia:section:state -->
No store library. State lives in composables and the `useFetch` cache.

- Active repo: persisted to localStorage by `useRepoStorage` (`src/composables/useRepoStorage.ts`); auto-cleared if the repo no longer exists.
- Current folder path: route query, via `useRouteQueryPath`.
- Session: `useUserSession()` from `nuxt-auth-utils`.
- After a mutation, composables call `refreshNuxtData()` to refetch.

## Build

<!-- exodia:section:build -->
Nuxt (Vite + Nitro). Scripts in `package.json`; `postinstall` runs `nuxt prepare`. Type-checking and ESLint run inside the dev server (`typescript.typeCheck`, `eslint.checker` in `nuxt.config.ts`).

## Runtime Model

<!-- exodia:section:runtime -->
`ssr: false`: pages render client-side only; Nitro still serves the proxy routes and the OAuth callback.

Data flow: page `useFetch('/gh-…')` → Nitro handler → `github()` (`server/utils/github.ts`: session, token, error mapping) → `api.github.com/repos/<user.login>/…` with the user's OAuth token as Bearer → raw GitHub payload back to client → `src/resources/*/parse.ts` narrows it to domain types.

The folder page refetches on an interval to renew GitHub `download_url` tokens (`src/pages/[repo]/[...path].vue`).

## L3 Data

<!-- exodia:section:l3 -->
- `decisions.jsonl`: Architecture Decision Records for non-obvious choices.
