# GitHub API proxy

The browser never calls `api.github.com` directly. Every GitHub call goes through a Nitro route in `server/routes/`, which attaches the user's OAuth token.

## Handler shape

Every handler (e.g. `server/routes/gh-repo-contents/index.put.ts`):

1. Routes on a vault repo validate `repo`/`path` with `getValidatedQuery(event, q => vaultRepoQuerySchema.parse(q))`: it rejects `.`/`..`/empty segments and returns `path` URL-encoded per segment. Never interpolate raw query values into a GitHub URL.
2. Validate body with `readValidatedBody(event, data => schema.parse(data))` when there is one.
3. Call `github(event, owner => '/repos/${owner}/…', { method, query, body })` from `server/utils/github.ts`. It owns the session, Bearer token, API version header and error mapping (GitHub's `message` becomes `statusMessage`, which `useOperationToast` shows). Don't call `$fetch` on `api.github.com` directly.
4. Owner is always the session user: `github` passes `user.login` to the endpoint builder.
5. Return the raw GitHub payload; the client narrows it.

## Types and schemas

`server/resources/gitHub<Thing>.ts` holds:

- response/request types derived from `@octokit/types` `Endpoints['<METHOD> <path>']`;
- the zod schema for the request body, typed `z.ZodType<RequestType>` so schema and type can't drift.

## Client side

- Mutations: `$fetch` called inside the mutation composable (`useVaultContents`, `useCreateUserRepo`); no separate wrapper module.
- Reads: `useFetch('/gh-…')` directly in pages/components.
- Import server types type-only via `~~/server/resources/*`.

## Adding an endpoint

1. Types + zod schema in `server/resources/gitHub<Thing>.ts`.
2. Handler `server/routes/gh-<thing>/index.<method>.ts` following the shape above.
3. Parser in `src/resources/<Entity>/parse.ts` for reads.
4. Writes to vault repo contents: a method on `useVaultContents`. Other writes: a composable in `src/composables/` that wraps `$fetch` in `useOperationToast().runOperation`.

## Gotchas

- Folders don't exist in git: a folder is created by writing `<name>/.gitkeep` (`useVaultContents().createFolder`); `.gitkeep` is hidden via `EXCLUDE_FILES` in `src/config.ts`.
- Replacing a file needs its current `sha` in the PUT body (`useVaultContents().replace`). The path is kept, so `pickAndReplace` limits the picker to the same extension.
- Deleting a file (`DELETE gh-repo-contents`, `useVaultContents().remove`) also needs its `sha`. It runs outside the upload queue, so a delete during uploads can still hit 409; the toast shows it. Folders can't be deleted this way (one file per commit): `DELETE gh-repo-tree` (`deleteVaultFolder` in `server/utils/deleteFolder.ts`) deletes one in a single commit with `sha: null` entries through `commitTreeChanges` (below); emptying the vault keeps a root `.gitkeep` since GitHub can't commit an empty tree. From the file page, `useFileActions().remove` navigates to the folder before deleting: `runOperation` refreshes every fetch, so the page would refetch the deleted file.
- Multi-file commits go through `commitTreeChanges` (`server/utils/commitTreeChanges.ts`): ref → recursive tree → tree on `base_tree` with the entries a caller-supplied builder returns → commit → non-forced `PATCH` ref. A truncated tree fails before any write. When the branch moved meanwhile (GitHub 422), it rebuilds once on the new head, then gives up with `vaultChanged`. Commit messages land in the user's repo, so they are plain sentences (`Rename foto.jpg to mare.jpg`, `Delete folder viaggi`), not conventional commits.
- There is no rename endpoint: `PATCH gh-repo-contents` (`server/utils/renameFile.ts`, `useVaultContents().rename`) renames a file in its folder through `commitTreeChanges`, so the content is never re-sent. It reads the old entry and the new path from the tree (not the contents listing, capped at 1,000 entries per folder), keeps the entry's mode (100755 stays executable) and refuses symlinks, submodules and folders. The extension is locked (`getLockedExtension` in `src/resources/CDNFiles/constants.ts`): the modal edits only the base name and the server rejects a changed one. Why not PUT + DELETE: ADR in `context/architecture/decisions.jsonl`. File-name rule shared by client and server: `isFileNameValid` in the same file (`utils.ts` there is browser-only).
- Errors the client must translate carry a code: `operationError(status, code, message)` puts it in `data.code` (`OperationErrorCode`), and `runOperation` shows `operationError.<code>` from the locale instead of `statusMessage`. Other errors still show GitHub's message. `runOperation`'s optional `onSuccess` replaces its default refresh, for callers that must navigate first (rename on the file page). Its optional `successToast` overrides the generic success toast and runs after the operation, so it can use the result (feedback links to the issue it opened).
- Upload content is base64 (`useVaultContents`).
- Uploads go through the shared queue in `useVaultContents` (`upload(files)`, shown by `UploadQueue.vue`): one PUT at a time, because parallel PUTs on one branch get 409; each file is first checked with a GET, and an existing file waits for Replace / Keep both (`name (n).ext`) / Skip.
- `download_url` carries a short-lived token: lists refetch on an interval.
- Creating a vault is two calls (`createVaultRepo` in `server/utils/vaultRepo.ts`): `POST /user/repos` takes no topics, so `PUT …/topics` follows; it replaces every topic. Use the name GitHub returns, it normalizes the requested one.
- Deleting a vault (`DELETE gh-user-repos`, `deleteVaultRepo` in `server/utils/vaultRepo.ts`) deletes the whole repo, and the token can delete any repo of the user: the repo is read first and refused (404) unless it has the vault topic and the session user owns it (a transferred repo redirects to its new owner). Needs the `delete_repo` scope, see `context/operations/OPERATIONS.md`.
- `gh-repo-tree` reads the branch from `runtimeConfig.public.ghDefaultBranch`.
