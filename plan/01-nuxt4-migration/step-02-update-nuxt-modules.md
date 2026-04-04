# Step 2: Update Nuxt modules

## 2.1 Update `@nuxt/eslint` and `@nuxtjs/i18n`

```bash
pnpm add @nuxt/eslint@1.14.0 @nuxtjs/i18n@10.2.3
```

| Module | Current | Target |
|--------|---------|--------|
| `@nuxt/eslint` | ^0.3.13 | 1.14.0 |
| `@nuxtjs/i18n` | ^8.5.3 | 10.2.3 |

## 2.2 Update `@nuxt/image` and `nuxt-auth-utils`

```bash
pnpm update @nuxt/image nuxt-auth-utils
```

| Module | Current | Target |
|--------|---------|--------|
| `@nuxt/image` | ^1.8.1 | latest (keep) |
| `nuxt-auth-utils` | 0.5.10 | latest (check Nuxt 4 compat) |

## 2.3 Verify module compatibility

Check that all modules declare Nuxt 4 compatibility (look for `nuxt: ^4` in their `peerDependencies`). Flag any that don't for manual review.
