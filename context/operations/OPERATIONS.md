<!-- purpose: Environments, configuration, deploys, and any per-variant behavior. Read when touching env vars, build config, or anything that differs between environments or variants. -->
# Operations

<!-- exodia:section:intro -->
Environments, configuration, deploys, and any per-variant behavior the codebase supports (environments, tenants, feature-flag cohorts, deployment targets, whatever applies). Read this when touching env vars, build config, or anything that differs between environments or variants.

## Environments

<!-- exodia:section:environments -->
Only local dev is defined. No CI (`.github/` absent), no staging/prod config in the repo.

- Env vars: template in `.env.example`, local values in `.env` (gitignored). Copy and fill per `README.md` § Environment Setup.
- Node version: `.nvmrc`. Package manager: `packageManager` in `package.json`.
- `.env` may carry legacy names not mapped to any `runtimeConfig` key: ignore them, `.env.example` is the source of truth.

## Variants

<!-- exodia:section:variants -->
Single variant. No tenants, markets or feature flags. Per-user isolation comes from the OAuth token (each user sees only their own vault repos).

## Configuration System

<!-- exodia:section:config -->
- `runtimeConfig` in `nuxt.config.ts`, overridden by `NUXT_*` env vars (Nuxt naming convention). Read with `useRuntimeConfig(event)` server-side, `useRuntimeConfig()` client-side for `public` keys.
- OAuth: `runtimeConfig.oauth.github` (`nuxt-auth-utils`); scope requested in `server/routes/auth/github.get.ts`.
- Session sealing: the `nuxt-auth-utils` session password env var (see `.env.example`); must be at least 32 characters.
- App constants (not env-driven): `src/config.ts`. UI theme: `src/app.config.ts` + `src/assets/css/main.css`.

## Deploy

<!-- exodia:section:deploy -->
No deploy pipeline in the repo. `.gitignore` lists `.netlify`, hinting at Netlify, but there is no Netlify config. Build output: `pnpm build` (Nitro server needed for proxy + OAuth, so static `generate` alone won't work).

## Localization / i18n (if applicable)

<!-- exodia:section:i18n -->
`@nuxtjs/i18n`, strategy and locales in `nuxt.config.ts` (`no_prefix`, single `en-US`). Strings in `src/locales/en-US.json`; `i18n/i18n.config.ts` types messages from that file, so a missing key is a type error. Add a key → edit the JSON, use `$t('key')`. VS Code: i18n-ally recommended (`.vscode/extensions.json`).

## L3 Data

<!-- exodia:section:l3 -->
- `variants.yaml`: per-variant behavioral differences (any axis the codebase varies along).
