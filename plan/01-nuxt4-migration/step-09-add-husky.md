# Step 9: Add Husky pre-push hook

## 9.1 Initialise Husky

```bash
pnpm husky init
```

## 9.2 Create pre-push hook

**File:** `.husky/pre-push`

```bash
pnpm lint && pnpm typecheck
```

## 9.3 Verify hook fires

Run `.husky/pre-push` directly to confirm it blocks on lint/type errors.
