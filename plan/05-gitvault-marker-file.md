# Repo Identification — Topic + Marker File Plan

## Goal
Replace the `gitvault-` name prefix convention with a dual approach:
1. **GitHub topic `gitvault`** for fast, zero-extra-call repo detection (primary)
2. **`.gitvault` marker file** in the repo root for human discoverability (secondary)

Repos can have any name. A repo is recognized by GitVault if it has the `gitvault` topic.

## Pre-requisites
- Complete **01-nuxt4-migration.md**, **02-structure-review.md**, and **03-testing.md** first (tests will catch regressions)

---

## Current behavior (full trace)

The prefix `gitvault-` is threaded through the entire stack:

1. **Constant**: `src/config.ts` defines `GITVAULT_REPO_PREFIX = 'gitvault-'`
2. **Branded type**: `src/resources/CDNUserRepos/index.ts` defines `` CDNUserRepoName = `${typeof GITVAULT_REPO_PREFIX}${string}` ``
3. **Type guard**: `src/resources/CDNUserRepos/utils.ts` — `isRepoNameValid(name)` checks `name.startsWith(GITVAULT_REPO_PREFIX)`
4. **Server GET**: `server/routes/gh-user-repos/index.get.ts` — filters all user repos with `.filter(repo => repo.name.startsWith(GITVAULT_REPO_PREFIX))`
5. **Server POST**: `server/resources/gitHubUserRepos.ts` — Zod schema enforces `name: z.string().startsWith(GITVAULT_REPO_PREFIX)`
6. **Client API**: `src/resources/CDNUserRepos/api.ts` — `CreateUserRepoPayload.name` typed as `CDNUserRepoName`
7. **Layout UI**: `src/layouts/default.vue` — prepends prefix: `` `${GITVAULT_REPO_PREFIX}${name}` ``
8. **Setup wizard**: `src/components/NoReposSetupWizard/Step2.vue` — prepends prefix and displays it in UI
9. **Middleware**: `src/middleware/03.active-repo.ts` — validates route param with `isRepoNameValid()`
10. **Composable**: `src/composables/useCreateRepo.ts` — passes typed name through to API

## New behavior

A repo is a GitVault repo if it has the `gitvault` topic. The `GET /user/repos` response already includes `topics[]` — so detection requires **zero extra API calls**.

The `.gitvault` marker file is added as a bonus for discoverability (users browsing the repo on GitHub can see it's a GitVault repo), but the topic is the authoritative signal.

---

## Why topics instead of marker file only?

| Approach | API calls to detect | Reliability | Setup complexity |
|----------|-------------------|-------------|-----------------|
| Name prefix (current) | 0 extra (filter response) | Perfect | None |
| Marker file only | N+1 (check each repo) | Good, but slow | Medium |
| Code Search API | 1 extra | Unreliable (empty files not indexed, indexing delays) | Low |
| **Topic (chosen)** | **0 extra (filter response)** | **Perfect** | **Low** |
| Topic + marker file | 0 extra for detection, +1 for marker on create | Perfect | Low |

The topic approach matches the current performance (zero extra calls) while removing the name constraint.

---

## Step 1: Update config constants

**File:** `src/config.ts`

```ts
// Remove:
export const GITVAULT_REPO_PREFIX = 'gitvault-'

// Add:
export const GITVAULT_TOPIC = 'gitvault'
export const GITVAULT_MARKER_FILE = '.gitvault'

// Update EXCLUDE_FILES to hide the marker in the file browser:
export const EXCLUDE_FILES = ['.gitkeep', '.gitvault']
```

## Step 2: Update server-side repo fetching

**File:** `server/routes/gh-user-repos/index.get.ts`

Replace the prefix filter with a topic filter. No extra API calls needed — `topics` is already in the response:

```ts
import { GITVAULT_TOPIC } from '~/config'

export default defineEventHandler(async (event): Promise<CDNUserReposData> => {
  const { secure } = await requireUserSession(event)
  const result = await $fetch<GhUserReposData>('https://api.github.com/user/repos', {
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    query: {
      per_page: 100,
    },
  })

  if (result) {
    return result.filter((repo): repo is CDNUserRepo =>
      repo.topics?.includes(GITVAULT_TOPIC)
    )
  }
  return result
})
```

**Key advantage:** Same single API call as before, just a different filter condition.

## Step 3: Update repo creation flow

**File:** `server/routes/gh-user-repos/index.post.ts`

When creating a repo, set the `gitvault` topic and add the `.gitvault` marker file:

```ts
import { GITVAULT_TOPIC, GITVAULT_MARKER_FILE } from '~/config'

export default defineEventHandler(async (event) => {
  const { secure, user } = await requireUserSession(event)
  const body = await readValidatedBody(event, data => repoSchemaPost.parse(data))

  // 1. Create the repo
  const repo = await $fetch('https://api.github.com/user/repos', {
    method: 'POST',
    body,
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  // 2. Set the gitvault topic
  await $fetch(`https://api.github.com/repos/${user.login}/${body.name}/topics`, {
    method: 'PUT',
    body: {
      names: [GITVAULT_TOPIC],
    },
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  // 3. Add .gitvault marker file (for human discoverability)
  await $fetch(`https://api.github.com/repos/${user.login}/${body.name}/contents/${GITVAULT_MARKER_FILE}`, {
    method: 'PUT',
    body: {
      message: 'Initialize GitVault repository',
      content: '', // empty file (base64 of empty string)
    },
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  return repo
})
```

**Note:** The GitHub `PUT /repos/{owner}/{repo}/topics` endpoint replaces all topics. If the repo already has topics (unlikely for a new repo), we'd need to merge them. For newly created repos this is fine.

## Step 4: Update Zod validation schema

**File:** `server/resources/gitHubUserRepos.ts`

Remove the prefix constraint. Repos can have any valid GitHub name:

```ts
// Before
export const repoSchemaPost = z.object({
  name: z.string().startsWith(GITVAULT_REPO_PREFIX),
  private: z.literal(true),
})

// After
export const repoSchemaPost = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9._-]+$/),
  private: z.literal(true),
})
```

Also update the server-side types — remove the `CDNUserRepo` name override since names are no longer branded:

```ts
// Before
export type CDNUserRepo = Omit<GhUserRepo, 'name'> & { name: CDNUserRepoName }

// After
export type CDNUserRepo = GhUserRepo
```

## Step 5: Remove prefix-based types and validation

### `src/resources/CDNUserRepos/index.ts`
Remove the branded template literal type:

```ts
// Before
import type { GITVAULT_REPO_PREFIX } from '~/config'
export type CDNUserRepoName = `${typeof GITVAULT_REPO_PREFIX}${string}`

// After
export type CDNUserRepoName = string
```

### `src/resources/CDNUserRepos/utils.ts`
Simplify validation — any non-empty string is valid (the server handles topic-based filtering):

```ts
// Before
import { GITVAULT_REPO_PREFIX } from '~/config'
export const isRepoNameValid = (repoName: string): repoName is CDNUserRepoName => {
  return repoName.startsWith(GITVAULT_REPO_PREFIX)
}

// After
export const isRepoNameValid = (repoName: string): repoName is CDNUserRepoName => {
  return repoName.length > 0
}
```

### `src/resources/CDNUserRepos/api.ts`
Update type:

```ts
export type CreateUserRepoPayload = {
  name: string
}
```

## Step 6: Update repo creation UI

### `src/layouts/default.vue`
- Remove the `GITVAULT_REPO_PREFIX` display in the modal
- Remove prefix concatenation: `` `${GITVAULT_REPO_PREFIX}${name}` `` → just `name`
- The user enters the full repo name directly

### `src/components/NoReposSetupWizard/Step2.vue`
- Remove the prefix display (`{{ GITVAULT_REPO_PREFIX }}` in template)
- Remove prefix concatenation: `` emit('create-repo', `${GITVAULT_REPO_PREFIX}${formState.value.name}`) `` → `emit('create-repo', formState.value.name)`
- Update i18n templates that reference `{repoPrefix}`

## Step 7: Update route middleware

**File:** `src/middleware/03.active-repo.ts`

The middleware uses `isRepoNameValid()` which now just checks for non-empty string. No structural changes needed:

```ts
// Still works — isRepoNameValid now checks repoName.length > 0
if (isRepoNameValid(routeRepoName)) {
  activeRepository.value = routeRepoName
}
```

## Step 8: Hide `.gitvault` from file listings

Already handled in Step 1 by adding `.gitvault` to `EXCLUDE_FILES`. Verify it works in:
- `src/pages/[repo]/[...path].vue` — where files are filtered using `isFileExcluded()`

## Step 9: Update i18n strings

Remove or update translation strings that reference the prefix pattern:
- Repo creation modal instructions
- Setup wizard step 2 instructions

## Step 10: Backward compatibility — migrate existing repos

Existing `gitvault-*` repos won't have the topic set. Options:

### Option A: One-time migration prompt (recommended)
When a user logs in and has repos matching `gitvault-*` but missing the `gitvault` topic, show a prompt to add the topic to those repos. The migration can be a single button that calls the topics API for each legacy repo.

### Option B: Dual detection (temporary)
During a transition period, detect repos by either topic OR prefix. Remove prefix detection after a set date.

### Option C: Auto-migrate on first load
Server-side: when fetching repos, if a repo has `gitvault-*` name but no topic, automatically set the topic. This is transparent to the user but mutates their repos silently.

**Recommended:** Option A — explicit user action, no surprises.

---

## Files to modify (summary)

| File | Change |
|------|--------|
| `src/config.ts` | Remove `GITVAULT_REPO_PREFIX`, add `GITVAULT_TOPIC` + `GITVAULT_MARKER_FILE`, update `EXCLUDE_FILES` |
| `src/resources/CDNUserRepos/index.ts` | Remove branded type, use plain `string` |
| `src/resources/CDNUserRepos/utils.ts` | Simplify `isRepoNameValid()` to non-empty check |
| `src/resources/CDNUserRepos/api.ts` | Update type to plain `string` |
| `server/resources/gitHubUserRepos.ts` | Remove prefix from Zod schema, simplify `CDNUserRepo` type |
| `server/routes/gh-user-repos/index.get.ts` | Replace prefix filter with `topics.includes('gitvault')` |
| `server/routes/gh-user-repos/index.post.ts` | Add topic + marker file on repo creation |
| `src/layouts/default.vue` | Remove prefix display and concatenation |
| `src/components/NoReposSetupWizard/Step2.vue` | Remove prefix display and concatenation |
| `src/middleware/03.active-repo.ts` | No structural changes (review only) |
| `src/composables/useCreateRepo.ts` | Minor type update |
| i18n locale files | Update strings referencing prefix |

## Verification

```bash
pnpm run typecheck
pnpm run unit
pnpm run dev
```

### Manual test checklist:
- [ ] Create a new repo with any name → topic `gitvault` is set, `.gitvault` file appears
- [ ] New repo shows up in the repo list
- [ ] Existing repos without `gitvault` topic are NOT listed
- [ ] A repo with `gitvault` topic and arbitrary name IS listed
- [ ] `.gitvault` file is hidden in the file browser
- [ ] Navigation and middleware still work correctly
- [ ] Repo creation wizard allows any name (no prefix prepended)

## Risks
- **Backward compatibility**: Existing `gitvault-*` repos need the topic added — requires migration step
- **Topic removal**: If a user manually removes the `gitvault` topic from a repo on GitHub, it disappears from GitVault. This is arguably correct behavior.
- **GitHub API topics field**: Verify that `GET /user/repos` always includes `topics` in the response (it does for authenticated requests with default accept header)
