<!-- purpose: Business language, entities, and how they relate. Read when a task involves business logic, models, or user-facing concepts. -->
# Glossary

<!-- exodia:section:intro -->
Business language, entities, and how they relate. Read this when a task involves business logic, models, or user-facing concepts.

## Entities

<!-- exodia:section:entities -->
| Term | Definition | Source |
|---|---|---|
| Vault repo (`CDNUserRepo`) | A GitHub repo owned by the user that has the `GITVAULT_TOPIC` topic; see `isVaultRepo`. The name is free (no prefix). Created private-only and tagged with the topic right after creation. | `server/resources/gitHubUserRepos.ts`, `server/utils/vaultRepo.ts`, `src/config.ts` |
| `CDNUserRepoName` | Repo name (plain `string`); `isRepoNameValid` only checks it is a safe GitHub repo name, not that it is a vault. | `src/resources/CDNUserRepos/` |
| Last opened vault | The vault last opened in this browser (localStorage); `/vaults` reopens it. Not a preference: the vault in the URL is the open one. | `src/composables/useRepoStorage.ts` |
| `CDNFile` | A GitHub contents entry narrowed to `type: 'file'`. | `src/resources/CDNFiles/index.ts` |
| `CDNFolder` | A directory entry as `{ name, to }` (`to` = navigation target). | `src/resources/CDNFolders/index.ts` |
| File category | Preview bucket (code, text, image, video, pdf, …) derived from extension. | `src/resources/CDNFiles/extensions.ts`, `utils.ts` |
| Excluded file | File hidden from listings (e.g. `.gitkeep` folder placeholders). | `src/config.ts` `EXCLUDE_FILES` |
| User / session | GitHub user (`id`, `login`) + OAuth tokens in the sealed session. | `shared/types/auth.d.ts` |
| First vault | Created automatically on `/vaults` (repo `personal`) when the user has no vault repo yet, with a retry on failure; no naming form. If they have vaults, `/vaults` opens the last opened one, or the first. | `src/pages/vaults/index.vue` |

"CDN" prefix = files are served from GitHub `download_url`s, not a real CDN.

## Relationships

<!-- exodia:section:relationships -->
- User 1:n Vault repo (owner = `user.login`; only repos passing `isVaultRepo` are listed, across every page of `/user/repos?affiliation=owner`).
- Browser 1:1 Last opened vault (may point to a deleted vault; checked against the list before use).
- Vault repo 1:n Folder, Folder 1:n Folder (nested via path).
- Folder 1:n CDNFile; CDNFile n:1 File category.

## User Journey

<!-- exodia:section:journey -->
1. `/` (public landing) → "Sign in with GitHub" → `/auth/github` OAuth (`server/routes/auth/github.get.ts`) → session → `/vaults`. Anonymous users on any app page are sent back to `/`.
2. `/vaults` → no vault repo? The first vault is created automatically (`useCreateRepo`) and opened. Otherwise the last opened vault (or the first) opens.
3. `/vaults/<repo>` → browse folders/files; path kept in the route query.
4. Create folder (writes `.gitkeep`) or upload file (base64 PUT).
5. `/vaults/<repo>/file/<path>` → preview by file category, download, replace.

## Type System

<!-- exodia:section:types -->
- GitHub shapes: derived from `@octokit/types` in `server/resources/*.ts`. Never hand-written.
- Domain types: `src/resources/<Entity>/index.ts`, narrowed from GitHub types.
- Session types: module augmentation in `shared/types/auth.d.ts`.
- Import: `import type { CDNFile } from '~/resources/CDNFiles'`; server types via `~~/server/resources/…`.
- Note: the boundary is crossed both ways; `server/` imports `GITVAULT_TOPIC` from `~/config` and `isRepoNameValid` from `~/resources/CDNUserRepos/utils`.

## L3 Data

<!-- exodia:section:l3 -->
- `glossary.yaml`: extended terminology and synonyms.
