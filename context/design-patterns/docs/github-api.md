# GitHub API proxy

The browser never calls `api.github.com` directly. Every GitHub call goes through a Nitro route in `server/routes/`, which attaches the user's OAuth token.

## Handler shape

Every handler (e.g. `server/routes/gh-repo-contents/index.put.ts`):

1. `requireUserSession(event)` → `{ user, secure }`. `secure.tokens.access_token` is the GitHub token (typed in `shared/types/auth.d.ts`).
2. Validate body with `readValidatedBody(event, data => schema.parse(data))` when there is one.
3. `$fetch` the GitHub endpoint with headers `Authorization: Bearer <token>` and `X-GitHub-Api-Version` (copy from an existing handler).
4. Owner is always `user.login`: users only touch their own repos.
5. Return the raw GitHub payload; the client narrows it.

## Types and schemas

`server/resources/gitHub<Thing>.ts` holds:

- response/request types derived from `@octokit/types` `Endpoints['<METHOD> <path>']`;
- the zod schema for the request body, typed `z.ZodType<RequestType>` so schema and type can't drift.

## Client side

- `src/resources/<Entity>/api.ts`: `$fetch` wrappers for mutations (`$putFile`).
- Reads: `useFetch('/gh-…')` directly in pages/components.
- Import server types type-only via `~~/server/resources/*`.

## Adding an endpoint

1. Types + zod schema in `server/resources/gitHub<Thing>.ts`.
2. Handler `server/routes/gh-<thing>/index.<method>.ts` following the shape above.
3. Client wrapper in `src/resources/<Entity>/api.ts` + parser in `parse.ts`.
4. Mutation composable in `src/composables/` (toast + `refreshNuxtData()`).

## Gotchas

- Folders don't exist in git: a folder is created by writing `<name>/.gitkeep` (`useCreateFolder`); `.gitkeep` is hidden via `EXCLUDE_FILES` in `src/config.ts`.
- Replacing a file needs its current `sha` in the PUT body (`useUploadFile` `replace` option). The path is kept, so the picker is limited to the same extension (`accept` in `src/components/FileCard/Menu.vue`).
- Upload content is base64 (`useUploadFile`).
- `download_url` carries a short-lived token: lists refetch on an interval.
- `gh-repo-tree` reads the branch from `runtimeConfig.public.ghDefaultBranch`.
