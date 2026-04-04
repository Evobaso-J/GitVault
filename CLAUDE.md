# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build (SPA mode)
pnpm generate     # Static site generation
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix ESLint issues
pnpm typecheck    # TypeScript type check (NODE_ENV=production)
pnpm unit         # Run Vitest tests once
pnpm unit:watch   # Run Vitest in watch mode
```

Run a single test file: `pnpm unit src/path/to/file.test.ts`

## Architecture

**GitVault** is a Nuxt 3 SPA (SSR disabled) that uses GitHub as a file storage backend. Users authenticate via GitHub OAuth, then create/manage repositories prefixed with `gitvault-` to store files.

### Directory layout

- `src/` — frontend (Nuxt srcDir)
- `server/` — Nuxt server routes and server-side GitHub API wrappers
- `src/resources/` — data layer: types, parsing utils, and API calls organized by domain (e.g. `CDNFiles/`, `ghRepoContents/`)
- `src/composables/` — Vue 3 composables that orchestrate resources and state
- `src/middleware/` — numbered route guards (`00.auth`, `01.guest`, `03.active-repo`, `04.no-active-repo`)

### Data flow

1. **Server routes** (`server/routes/`) proxy all GitHub API calls; they validate sessions and forward requests using the user's OAuth token.
2. **Resources** (`src/resources/`) are the frontend data layer — each resource folder has types, a parsing util, and a fetch function (e.g. `CDNFolders/types.ts`, `CDNFolders/parse.ts`, `CDNFolders/api.ts`).
3. **Composables** (`src/composables/`) consume resources and wire in UI state (loading, toast, localStorage).

### Key conventions

- All user repos must carry the `GITVAULT_REPO_PREFIX = "gitvault-"` prefix (defined in `src/config.ts`).
- File uploads use base64 encoding through the GitHub Contents API (`PUT /gh-repo-contents`).
- Download URLs are refreshed every 5 minutes via `useInterval`.
- Custom errors extend `BaseError` from `src/errors.ts`.
- Zod is used for runtime validation of server route payloads (`readValidatedBody`).
- Active repo selection is persisted to `localStorage` via `useRepoStorage`.

### Environment variables

Copy `.env.example` to `.env`. Required:
- `NUXT_OAUTH_GITHUB_CLIENT_ID`
- `NUXT_OAUTH_GITHUB_CLIENT_SECRET`
- `NUXT_SESSION_PASSWORD` (min 32-char secret for session encryption)
