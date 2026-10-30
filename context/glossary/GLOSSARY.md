<!-- purpose: Business language, entities, and how they relate. Read when a task involves business logic, models, or user-facing concepts. -->
# Glossary

<!-- exodia:section:intro -->
Business language, entities, and how they relate. Read this when a task involves business logic, models, or user-facing concepts.

## Entities

<!-- exodia:section:entities -->
| Term | Definition | Source |
|---|---|---|
| Vault repo (`CDNUserRepo`) | A GitHub repo owned by the user that has the `GITVAULT_TOPIC` topic or (legacy, transition) a name starting with `GITVAULT_REPO_PREFIX`; see `isVaultRepo`. Created private-only and tagged with the topic right after creation. | `server/resources/gitHubUserRepos.ts`, `server/utils/vaultRepo.ts`, `src/config.ts` |
| `CDNUserRepoName` | Repo name (plain `string`); `isRepoNameValid` only checks it is a safe GitHub repo name, not that it is a vault. | `src/resources/CDNUserRepos/` |
| Active repository | The vault repo currently selected; persisted client-side. | `src/composables/useRepoStorage.ts` |
| `CDNFile` | A GitHub contents entry narrowed to `type: 'file'`. | `src/resources/CDNFiles/index.ts` |
| `CDNFolder` | A directory entry as `{ name, to }` (`to` = navigation target). | `src/resources/CDNFolders/index.ts` |
| File category | Preview bucket (code, text, image, video, pdf, …) derived from extension. | `src/resources/CDNFiles/extensions.ts`, `utils.ts` |
| Excluded file | File hidden from listings (e.g. `.gitkeep` folder placeholders). | `src/config.ts` `EXCLUDE_FILES` |
| User / session | GitHub user (`id`, `login`) + OAuth tokens in the sealed session. | `shared/types/auth.d.ts` |
| First vault form | Single-screen onboarding shown on `/` when the user has no vault repo yet; if they have vaults but none active, `/` shows a vault picker instead ("Did you get lost?"). | `src/pages/index.vue` |

"CDN" prefix = files are served from GitHub `download_url`s, not a real CDN.

## Relationships

<!-- exodia:section:relationships -->
- User 1:n Vault repo (owner = `user.login`; only `gitvault-*` repos are listed).
- User 1:1 Active repository (client-side choice, must be one of the user's vault repos).
- Vault repo 1:n Folder, Folder 1:n Folder (nested via path).
- Folder 1:n CDNFile; CDNFile n:1 File category.

## User Journey

<!-- exodia:section:journey -->
1. `/login` → GitHub OAuth (`server/routes/auth/github.get.ts`) → session.
2. `/` → no vault repo? The first vault form creates one (`useCreateRepo`) and opens it. Otherwise pick the active repo.
3. `/<repo>` → browse folders/files; path kept in the route query.
4. Create folder (writes `.gitkeep`) or upload file (base64 PUT).
5. `/<repo>/file/<path>` → preview by file category, download, replace.

## Type System

<!-- exodia:section:types -->
- GitHub shapes: derived from `@octokit/types` in `server/resources/*.ts`. Never hand-written.
- Domain types: `src/resources/<Entity>/index.ts`, narrowed from GitHub types.
- Session types: module augmentation in `shared/types/auth.d.ts`.
- Import: `import type { CDNFile } from '~/resources/CDNFiles'`; server types via `~~/server/resources/…`.
- Note: the boundary is crossed both ways; `server/` imports `GITVAULT_TOPIC`/`GITVAULT_REPO_PREFIX` from `~/config` and `isRepoNameValid` from `~/resources/CDNUserRepos/utils`.

## L3 Data

<!-- exodia:section:l3 -->
- `glossary.yaml`: extended terminology and synonyms.
