# Step 8: Add npm scripts

**File:** `package.json`

## 8.1 Update `scripts` block

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "nuxt typecheck",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:nuxt": "vitest run --project nuxt",
    "prepare": "husky"
  }
}
```

## 8.2 Verify all scripts run

```bash
pnpm lint
pnpm typecheck
pnpm test
```
