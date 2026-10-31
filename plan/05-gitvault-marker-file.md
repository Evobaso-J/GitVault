# Repo Identification — GitHub Topic Plan

## Goal
Stop relying on the `gitvault-` name prefix to recognize vaults. A repo is a vault if it has the
GitHub topic `gitvault`, so repos can eventually have any name.

## Scope decision: topic only, no `.gitvault` marker file
The original plan also wrote a `.gitvault` marker file into every vault for human discoverability.
Dropped: detecting by marker needs one contents/tree call per repo on every list, while
`GET /user/repos` already returns `topics[]`, so topic detection costs zero extra calls. The topic is
also visible on GitHub, which covers discoverability. ADR in `context/architecture/decisions.jsonl`.

| Approach | Extra calls to list vaults |
|----------|----------------------------|
| Name prefix (before) | 0 |
| Marker file | N (one per repo) |
| **Topic (chosen)** | **0** |

---

## Phase 1 — this PR (`feat/vault-topic`)

1. **Config** — `src/config.ts`: add `GITVAULT_TOPIC = 'gitvault'`; keep `GITVAULT_REPO_PREFIX` for the transition.
2. **Detection** — `isVaultRepo` in `server/resources/gitHubUserRepos.ts`: topic `gitvault` **or** name starts with the prefix (existing untagged vaults keep working, no migration). `server/routes/gh-user-repos/index.get.ts` filters with it.
3. **Creation** — `createVaultRepo` in `server/utils/vaultRepo.ts`: `POST /user/repos` (it takes no topics), then `PUT /repos/{owner}/{repo}/topics` with `{ names: ['gitvault'] }` on the name GitHub returned. If the PUT fails the repo exists but is untagged: the error keeps GitHub's status and names the repo, so the toast says so instead of a plain failure.
4. **Validation** — the POST zod schema accepts any non-empty name (it only travels in the JSON body; GitHub normalizes it). `CDNUserRepoName` becomes `string`. `isRepoNameValid` (route middleware) now checks the name is a safe GitHub repo name (`[\w.-]+`, not `.`/`..`), not the prefix; `vaultRepoQuerySchema` reuses it.
5. **Tests** — `isVaultRepo`, `isRepoNameValid`, `createVaultRepo` (call order, endpoint, failure message).

The naming UI is untouched: new vaults still get the `gitvault-` prefix, so they are detected both ways.

## Phase 2 — follow-up

1. **Naming UI** (done in `feat/frictionless-onboarding`: prefix hidden via `getVaultLabel`, new vaults still created with it) — drop the prefix display and concatenation in `src/components/VaultNavigation.vue` and `src/components/NoReposSetupWizard/Step2.vue`; update i18n strings that use `{repoPrefix}`. Do it after the redesign PRs touching those files land.
2. **Retire the prefix fallback** — once legacy vaults are tagged (an explicit "tag my existing vaults" action, or a cut-off date), drop the prefix branch of `isVaultRepo` and `GITVAULT_REPO_PREFIX`. Do not tag repos silently on list.

## Verification
`pnpm lint`, `pnpm typecheck`, `pnpm unit`, `pnpm build`.

Manual (needs a real GitHub login):
- [ ] Create a vault → it gets the `gitvault` topic on GitHub and shows in the list
- [ ] A repo with the `gitvault` topic and any name is listed
- [ ] A legacy `gitvault-*` repo without the topic is still listed
- [ ] A repo with neither is not listed

## Risks
- **Half-created vault**: if the topic PUT fails, the repo exists untagged. While it has the prefix it still shows up; after Phase 2 it would not, and the error message tells the user which repo.
- **Topic removal**: removing the topic on GitHub hides a non-prefixed vault. Arguably correct.
- **Pagination**: `GET /user/repos` is not paginated today, so vaults past the first page are missed (pre-existing, independent of this change).
