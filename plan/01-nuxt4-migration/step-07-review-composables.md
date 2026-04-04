# Step 7: Review breaking changes in composables

## 7.1 Review `useFetch` / `$fetch` dedupe behaviour

Nuxt 4 may change default `dedupe` behaviour. Review: `app/composables/useRepoStorage.ts` (line 16).

## 7.2 Verify `useRoute` / `useRouter` param typing

Check route param typing in:

- `app/composables/useUploadFile.ts` (line 36)
- `app/middleware/03.active-repo.ts`

## 7.3 Check `defineNuxtRouteMiddleware`

Verify the API is unchanged in Nuxt 4. Files: all 4 middleware files under `app/middleware/`.

## 7.4 Fix any type errors surfaced

```bash
pnpm typecheck
```

Resolve each error before moving on.
