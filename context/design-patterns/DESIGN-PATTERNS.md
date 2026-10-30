<!-- purpose: Code conventions, idioms, and shared utilities. Read this before introducing new patterns. -->
# Design Patterns

<!-- exodia:section:intro -->
> **Progressive disclosure:** this file holds short guardrails only (do/don't, 2-3 lines per topic). Detailed explanations live in `./docs/`. Drafted sections cite files and link to deep dives when a topic warrants more than ~3 lines.

<!-- exodia:section:body -->
## GitHub API proxy

See [docs/github-api.md](docs/github-api.md) for full details.

## Domain resources

One folder per entity in `src/resources/<Entity>/` (`index.ts` / `api.ts` / `parse.ts` / `utils.ts`). Never consume raw GitHub payloads in components: narrow them in `parse.ts` first (`src/resources/CDNFiles/parse.ts`).

## Composables & mutations

Mutations live in `src/composables/use*.ts`, not in components. Follow the toast lifecycle (loading → `toast.update` success/error), call `refreshNuxtData()` on success, return `OperationStatus` (`src/composables/useCreateFolder.ts`). No Pinia.

## Validation

Server: validate every body with zod via `readValidatedBody` (`server/routes/gh-user-repos/index.post.ts`). Client forms: `UForm` + zod schema kept next to the resource (`src/resources/CDNUserRepos/constants.ts`).

## Components & UI

Use Nuxt UI 4 `U*` components + Tailwind 4 utilities. Palettes in `src/assets/css/main.css` (Tailwind 4 `@theme`), semantic color mapping in `src/app.config.ts`. Icons: Iconify classes (`i-mdi-*`, …) from collections in `package.json` devDependencies.

## File previews

New preview type: add extensions in `src/resources/CDNFiles/extensions.ts`, then a `FilePreview/<Category>.vue` branch in `src/components/FilePreview/index.vue`. Unknown types fall to `Fallback.vue`.

## i18n

No hardcoded user-facing strings. Use `$t` / `useI18n`; add keys to `src/locales/en-US.json` (the message schema in `i18n/i18n.config.ts` is typed from it).

## Types

Compiler is strict (`noUncheckedIndexedAccess`, see `nuxt.config.ts`): guard indexed access. Reuse helpers in `src/helpers.ts`; derive GitHub types from `@octokit/types`, never hand-write them.

## Errors

Custom errors extend `BaseError` with a literal `name` (`src/errors.ts`).

## Testing

Vitest with `environment: 'nuxt'` (`vitest.config.ts`); co-locate `*.test.ts` next to the code (`src/resources/CDNFiles/utils.test.ts`). Single file: `pnpm unit <path>`.

## Lint & formatting

ESLint stylistic only (`eslint.config.mjs`); Prettier is deliberately off (`.vscode/extensions.json`). Run `pnpm lint:fix`.

## L3 Data

<!-- exodia:section:l3 -->
- `reviews.jsonl`: PR review checks, migrations, anti-patterns.
