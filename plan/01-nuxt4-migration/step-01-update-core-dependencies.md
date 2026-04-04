# Step 1: Update core dependencies

**File:** `package.json`

## 1.1 Update `packageManager` field

```json
"packageManager": "pnpm@10.29.2"
```

## 1.2 Add engine constraints

```json
"engines": {
  "node": ">=23.6.0"
},
"engineStrict": true
```

## 1.3 Install/update runtime dependencies

```bash
pnpm add nuxt@^4.3.1 vue@^3.5.28 vue-router@^4.6.4
```

## 1.4 Install/update dev dependencies

```bash
pnpm add -D typescript@^5.9.3 vue-tsc@^3.2.5 vitest@^4.0.18 @nuxt/test-utils@^4.0.0 happy-dom@^20.7.0 playwright-core@^1.58.2 eslint@^10.0.1 husky@^9.1.7
```

Target versions:

| Package | Current | Target |
|---------|---------|--------|
| `nuxt` | ^3.12.1 | ^4.3.1 |
| `vue` | ^3.4.21 | ^3.5.28 |
| `vue-router` | (implicit) | ^4.6.4 (add explicitly) |
| `typescript` | 5.4.4 | ^5.9.3 |
| `vue-tsc` | ^1 | ^3.2.5 |
| `vitest` | ^3.0.9 | ^4.0.18 |
| `@nuxt/test-utils` | ^3.17.2 | ^4.0.0 |
| `eslint` | (implicit) | ^10.0.1 (add explicitly) |
| `happy-dom` | ^17.0.2 | ^20.7.0 |
| `playwright-core` | — | ^1.58.2 (new) |
| `husky` | — | ^9.1.7 (new) |

## 1.5 Verify lockfile

```bash
pnpm install
```

Ensure no peer-dependency conflicts are reported.
