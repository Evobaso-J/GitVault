<!-- purpose: How to diagnose common problems. Start here when something breaks. -->
# Debugging

<!-- exodia:section:intro -->
How to diagnose common problems. Start here when something breaks.

## Local Environment Setup

<!-- exodia:section:env-setup -->
1. Node from `.nvmrc` (`nvm use`), pnpm from `package.json` `packageManager` (`corepack enable`).
2. `pnpm install` (runs `nuxt prepare`).
3. `cp .env.example .env`, fill it in. Needs a GitHub OAuth App: see `README.md` § GitHub OAuth App Setup.
4. `pnpm dev`. Checks: `pnpm typecheck`, `pnpm lint`, `pnpm unit`.

## How to use this module

<!-- exodia:section:how-to-use -->
1. Reproduce the symptom.
2. Search `playbooks.jsonl` for matching symptoms.
3. If found → follow the playbook's fix.
4. If not found → once solved, append a new playbook entry per the Self-Update Rules. Recurring footguns count: the footgun IS the symptom; name how it surfaces.

## Common Topics

<!-- exodia:section:topics -->
- **GitHub proxy errors (404/401/409)**: check route params reach the handler (undefined → `/contents/undefined`), session token, `sha` on replace. See `context/design-patterns/docs/github-api.md`.
- **Nuxt 4 / vue-router 5 migration**: catch-all params can be `undefined` at root; Nuxt UI 4 menu `onSelect` semantics changed. Commits `0e46419`, `f2ee7ed`.
- **Tailwind 4 styling**: default border color is now `currentColor`; restored in `src/assets/css/main.css`.
- **Auth / session**: redirect loops → check page `definePageMeta` middleware and `useUserSession()`; OAuth scope in `server/routes/auth/github.get.ts`.
- **Garbled non-ASCII text in previews**: GitHub contents are base64; decode via `decodeBase64Utf8` (`src/resources/CDNFiles/utils.ts`), never bare `atob`.
- **Stale file URLs**: GitHub `download_url` tokens expire; listings refetch on interval.
- **Active repo vanishes**: `useRepoStorage` clears it if the repo is no longer in `gh-user-repos`.

## L3 Data

<!-- exodia:section:l3 -->
- `playbooks.jsonl`: symptom → root cause → fix recipes. Includes recurring footguns (the footgun IS the symptom).
