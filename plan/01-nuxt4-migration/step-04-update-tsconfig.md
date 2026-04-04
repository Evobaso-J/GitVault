# Step 4: Update TypeScript config

**File:** `tsconfig.json`

## 4.1 Replace `extends` with `references`

Replace the old `extends: "./.nuxt/tsconfig.json"` pattern with Nuxt 4 project references:

```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

## 4.2 Add strict options

Add `noImplicitAny` and `noUncheckedIndexedAccess` to the Nuxt config or a `tsconfig.base.json` override as needed.
