# Step 5: Update ESLint config

**File:** `eslint.config.mjs`

## 5.1 Replace config body

```js
// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
)
```

## 5.2 Verify lint passes

```bash
pnpm lint
```
