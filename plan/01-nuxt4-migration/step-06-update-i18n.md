# Step 6: Update i18n setup

## 6.1 Move locale files

Move `app/locales/` → `app/i18n/locales/` (nuxt-starter convention).

## 6.2 Remove or update the separate i18n config file

Delete `i18n.config.ts` if it exists, or update it to v10 format. The inline config in `nuxt.config.ts` (Step 3.5) replaces it.

## 6.3 Verify `defineI18nConfig` and type-safe schema

Check that any `defineI18nConfig` usage and locale type schemas still work under `@nuxtjs/i18n` v10.

## 6.4 Smoke-test translations

```bash
pnpm dev
```

Navigate to a translated page and confirm strings render correctly.
