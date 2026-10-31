# Phone Backup Plan (merge of #37 "gallery backup" and #39 "upload key + ingest")

## Status (2026-10-31)
The owner chose to ship in phases:
1. **Now: manual backup only.** PR #37, amended: page renamed "Phone backup", a name clash keeps both without asking, wake lock while uploading. Shared module, registry and automatic sections are not built yet.
2. **Next PR: automatic daily backup** (D3, D5, D6 and the server half of D2). PR #39 stays as the reference prototype.
3. **Later: files over 4 MiB** (videos), by splitting them into several files in the repo and joining them back on download. Not in this plan.

The decisions below describe the full target. In phase 1, `MAX_UPLOAD_BYTES` and the dedupe stay where #37 put them (`src/config.ts`, `src/utils/galleryBackup.ts`). They move to `shared/utils/backup.ts` together with phase 2, when the server needs them.

## Goal
One feature, one page per vault, two ways to get phone photos into `Photos/YYYY/MM/`:
1. **Back up now**: pick photos in the browser, only new content is uploaded (from PR #37).
2. **Automatic daily backup**: a prebuilt iOS Shortcut (and an Android HTTP Shortcuts import) posts photos to `POST /ingest` with a sealed upload key (from PR #39).

Both paths share the same folder, date rule, dedupe, size cap and code. The page shows whether a phone is connected and when the last automatic backup arrived, and it lets the user revoke a key.

PR #38 (PWA share target) was rejected as not user-friendly and is not revived.

## Pre-requisites
- Both branches fork from the same `main` commit, so neither conflicts with `main`. They only conflict with each other in `src/composables/useVaultContents.ts` and `src/locales/en-US.json`.
- Hard limits taken as given ([Netlify Functions config](https://docs.netlify.com/build/functions/configuration/)):
  - Netlify function body 6 MB. Binary bodies are base64-encoded, so ~4.5 MB raw. Over-limit requests get 500/502.
  - 60 s synchronous execution.
  - GitHub Contents API: one PUT per file, serial on one branch (409 otherwise).
  - Mobile browsers suspend JS when the screen locks.
- Manual work only the owner can do: build and publish the iOS Shortcut once (iCloud link), export the HTTP Shortcuts zip once (Step 9).
- No new env var, no new dependency, no DB.

---

## Decisions

### D1. Information architecture: one page `/<vault>/backup`, two stacked sections, no modal
Keep B's page and route (`src/pages/[repo]/backup.vue`, sidebar link in `src/layouts/default.vue`) and rename it **"Phone backup"**. Drop C's user-menu item and `UploadKeyModal.vue`, for two reasons:
- A modal hides the state the user needs: is my phone connected, did it run last night.
- "Phone uploads" next to "Logout" is where nobody looks.

The layout is mobile-first: `max-w-md mx-auto`, stacked `UCard`s. There are no tabs between the two modes, because on a phone tabs hide the second one.

1. **Header**: icon, "Phone backup", and one line: "Keep your phone's photos in {repo}: on demand, or every night without opening the app."
2. **Card "Back up now"**:
   - Description and one big `Choose photos and videos` button (B's picker).
   - Result list: N new → queued, M already backed up, K too large (with names).
   - Hint: "Keep this page open until the uploads finish."
   - Progress stays in the existing `UploadQueue`.
3. **Card "Automatic daily backup"**, driven by state:
   - Status line, from commits (D6): "Last automatic backup 3 hours ago · 12 photos", "No automatic backup received yet", or a warning when nothing arrived for more than 2 days.
   - "Connected devices": rows like `iPhone · since 31 Oct [Revoke]`, from the key registry (D5). Empty when there are none.
   - `UTabs` **iPhone | Android**, default tab from `navigator.userAgent`. Each tab is a 3–4 step list with buttons (D3). On desktop the iPhone tab says "Open this page on your iPhone to connect it".
4. **Footnote shared by both modes**: "Everything lands in Photos / year / month. The same photo is never uploaded twice. Files over 4 MB are skipped (most videos)."

Page states:

| State | When | What the user sees |
|---|---|---|
| `loading` | Tree and commits are being fetched | Skeleton |
| `error` | A fetch failed | B's alert with retry |
| `empty` | No keys, no automatic runs yet | Setup steps |
| `connected` | At least one key | Device list and status line |
| `stale` | Connected, but the last run is older than 2 days | Status line warning |

How each mode shows progress and completion:
- Manual: the upload queue.
- Automatic: the status line, plus the Shortcut's own notification on the phone.

The two modes share no settings:
- The base folder is a constant and the date rule and dedupe are one shared function (D2).
- The key carries the folder sealed inside, so the server enforces it, but the UI never asks for it.

### D2. One folder, one date rule, one dedupe, in one shared module
New `shared/utils/backup.ts`. Nuxt 4 auto-imports `shared/utils/*` on both app and server. It replaces:
- `src/utils/galleryBackup.ts` (B)
- `src/utils/withCopyNumber.ts` (C)
- `getIngestPath` (C)
- `MAX_UPLOAD_BYTES` in `src/config.ts` (B)

```ts
export const BACKUP_FOLDER = 'Photos'                 // fixed, no per-user setting (open question 3)
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024        // 4 MiB raw → 5.6 MB base64 < Netlify 6 MB
export const BACKUP_COMMIT_MESSAGE = 'feat: phone backup'  // marker for D6
export const UPLOAD_KEYS_DIR = '.gitvault/keys'        // registry for D5
export const gitBlobSha = (blob: Blob) => Promise<string>          // B's; Web Crypto works in Node ≥ 20 too
export const withCopyNumber = (path: string, copy: number) => string
export type YearMonth = { year: number, month: number }
export const yearMonthOf = (date: Date) => YearMonth                // local getters
export const parseTakenAt = (taken?: string) => YearMonth | undefined  // /^(\d{4})-(\d{2})/ on the string, no tz conversion
export const getBackupPath = (folder: string, name: string, ym: YearMonth) => string  // `${folder}/${yyyy}/${mm}/${name}`
export type BackupIndex = { shas: Set<string>, paths: Set<string> }
export const indexTree = (tree: { path?: string, sha?: string, type?: string }[]) => BackupIndex
export type Placement = { status: 'exists' } | { status: 'tooLarge' } | { status: 'upload', path: string }
export const placeFile = (index: BackupIndex, file: { target: string, sha: string, size: number }) => Placement  // mutates index so a batch dedupes against itself
```

**Folder.** `Photos` for everyone. C's folder picker is dropped: a per-user setting would need storage (there is none) or would have to be typed identically in two places, and nobody asked for it.

**Date source.** The month is the one on the phone's clock.
- Browser path: `yearMonthOf(new Date(file.lastModified))`, as in B.
- Ingest path: the Shortcut sends an optional multipart text field **`taken`** (`Get Details of Images → Date Taken → Format Date`, ISO 8601 with offset). The server takes year and month from the first 7 characters of the string. That way a photo taken at 23:30 local on the 31st stays in its month, whatever the server's UTC clock says.
- Fallback when `taken` is missing (Android share, curl): `yearMonthOf(new Date())` on the server. C's UTC rule goes away.
- No EXIF parsing in the browser: parsing HEIC means walking its box structure, which isn't worth it. iOS reporting a wrong `lastModified` is documented as a known limit.

**Dedupe, identical on both sides.**
1. Fetch the recursive tree once: once per batch in the browser, once per request on the server. Build `indexTree`.
2. For each file, `placeFile` decides:
   - content sha anywhere in the vault → `exists`, skip;
   - size over the cap → `tooLarge`;
   - path taken by different content → `name (n).ext`, picked against the tree without extra GETs;
   - otherwise → upload.

What this buys:
- The ingest path becomes as good as B's: dedupe survives renames and moves.
- Same GitHub call count C already pays: 1 GET tree + 1 PUT per file, instead of 1 GET contents + 1 PUT. C's GET loop on copy numbers goes away.
- The browser path never shows the "Replace / Keep both" prompt for photos.

Cost: the tree payload grows with the vault, about 150 B per entry, so 10k photos ≈ 1.5 MB of JSON from GitHub. That is an outbound call, so the 6 MB cap doesn't apply. Mark it with `// ponytail: tree per request; switch to GET contents of the month folder if vaults pass ~50k files`.

`useVaultContents().upload(files, getPath)` keeps B's signature; the page passes `file => planned.get(file)`. The queue's own `findExisting` GET still runs for each file. With the plan above it never finds a conflict, but leaving it means the queue stays untouched.

### D3. Daily automation setup: prebuilt shortcut + one-tap key hand-off (iOS first)

**iOS** is first-class: it is the automatic path that actually runs unattended.

Publishing:
- The owner publishes a Shortcut **"GitVault Backup"** once via Share → Copy iCloud Link, and puts the URL in `src/config.ts` `IOS_SHORTCUT_URL`.
- iCloud links are immutable snapshots: updating the shortcut means a new link, so the constant changes too.

Steps on the page:
1. **"Add the shortcut"**: `UButton :to="IOS_SHORTCUT_URL"`. It opens Shortcuts and the user taps Add Shortcut. Since iOS 15 there is no "untrusted shortcuts" toggle to enable.
2. **"Connect this iPhone"**: `POST /upload-key { repo, platform: 'ios' }`, then `location.href = 'shortcuts://run-shortcut?name=GitVault%20Backup&input=text&text=' + encodeURIComponent(JSON.stringify({ url: ingestUrl, key }))`. This URL scheme is documented by Apple.
   - The shortcut gets the input, runs `Get Dictionary from Input` and `Save File` to iCloud Drive `Shortcuts/GitVault/config.json` (overwrite), and shows "GitVault connected".
   - It then runs a first backup in the foreground. That also triggers the one-time Photos and "allow connecting to host" permission prompts.
   - The key is never displayed or pasted on iOS.
   - The ingest URL travels with the key, so the same published shortcut works for deploy previews and self-hosters.
3. **"Make it run every night"**: text instructions only, since no URL scheme exists for automations. Shortcuts → Automation → + → Time of Day → 02:00, Daily → Run Immediately (iOS 17+) → Next → GitVault Backup.

Shortcut body (the owner builds it; the same spec goes in the README):
1. `If Shortcut Input has any value` → `Get Dictionary from Input` → `Save File` (`Shortcuts/GitVault/config.json`, overwrite) → `Show Notification "GitVault connected"`.
2. `Get File` `GitVault/config.json` → `Get Dictionary` → `url`, `key`. If either is missing → `Show Alert "Open GitVault on this iPhone → Phone backup → Connect"` → `Stop`.
3. `Find Photos` where `Date Taken is in the last 2 days` and `Media Type is Image` (videos: open question 1), sorted by Date Taken, no limit.
   - Why 2 days and not 1: a missed night (phone off) is picked up the next run, and re-sends cost nothing thanks to D2.
4. `Repeat with Each`, **one file per request, always**:
   - `Get Details of Images` (File Size). If `> 4 MB` → append the name to a `Skipped` list.
   - Otherwise `Get Details of Images` (Date Taken) → `Format Date` (ISO 8601) → `Get Contents of URL`:
     - POST `{url}`, header `Authorization: Bearer {key}`
     - Request Body **Form**: `file` = Repeat Item (File), `taken` = formatted date (Text)
   - `Get Dictionary from Input` → add to the Uploaded / Already there counts.
5. `Show Notification` "GitVault: {uploaded} uploaded, {skipped} already there, {tooLarge} too large".

**Android**: the manual share is first-class. Daily automation is documented, not built into the product.

What HTTP Shortcuts offers:
- A documented import deep link: `https://http-shortcuts.rmy.ch/import?url=<encoded URL of a zip>`.
- Exported global variables, with the option to leave a variable's value out of the export.
- No built-in time trigger.

Owner setup:
- Export a shortcut "GitVault" once:
  - POST `{gitvault_url}/ingest`, header `Authorization: Bearer {gitvault_key}`
  - Form body with a File parameter `file` that accepts shared files
  - Variables: `gitvault_url` = Static with the production URL, `gitvault_key` = Static with its value excluded from the export
- Commit the zip to `public/phone-backup/gitvault-android.zip`.

Steps on the page:
1. "Install HTTP Shortcuts" (Play link).
2. "Import the GitVault shortcut" (button to the import deep link, with the zip URL of the current host).
3. "Generate a key": `POST /upload-key { platform: 'android' }`, shows the key once with C's copy field, then "paste it in HTTP Shortcuts → Variables → gitvault_key".
4. "Select photos in your gallery → Share → HTTP Shortcuts → GitVault".

A daily run on Android needs Tasker or MacroDroid to list the camera folder. That is a power-user recipe for the README, not a product step (open question 2). Android users get "Back up now" for the daily habit.

### D4. Size limit: one constant, fail fast on both sides, honest about videos
Enforcement:
- `MAX_UPLOAD_BYTES = 4 MiB` lives in `shared/utils/backup.ts`. C's 20 MB `MAX_INGEST_BYTES` is deleted.
- Ingest checks `content-length` against `MAX_UPLOAD_BYTES + 16 KiB` (multipart overhead) and returns 413 before reading the body. `placeFile` also checks each part's size.
- The browser and the Shortcut skip oversize files before sending. Netlify's 502 can only be reached by hand-crafted requests.

What the user sees:
- the footnote on the page;
- the per-file list in "Back up now";
- the `tooLarge` count in the Shortcut notification;
- `{ tooLarge: [] }` in the ingest response.

Videos: the picker accepts them, but almost all are skipped. The daily shortcut sends images only by default.

Ways past 4.5 MB without giving the browser the token, all evaluated and not adopted:

| Option | Why not |
|---|---|
| (a) Git Data API blobs in chunks | A blob is one object and GitHub has no multi-part blob. Chunks would need server-side temp storage between requests (Netlify Blobs, a new Netlify-only dependency) plus a Background Function (15 min) to assemble and PUT: ~150 lines plus ops work. |
| (b) Browser → GitHub directly | Needs the token in the browser, rejected by ADR `adr_20261030_114425_cf4a`. |
| (c) Git LFS batch API | Returns presigned upload URLs that wouldn't carry the OAuth token, but CORS on LFS storage is unverified and the free quota is 1 GB. |

**Recommendation:** keep 4 MiB, as one constant so a non-Netlify host can raise it. Revisit (a) only if videos become a real request.

### D5. Upload key security: keep the sealed token, add a per-key registry in the vault
Keep C's seal: AES-256-GCM under a key HKDF-derived from `NUXT_SESSION_PASSWORD`. No DB, no new secret, and encryption rather than just signing, because the payload carries the token.

Add a `kid` to the payload and an **allow-list file** `.gitvault/keys/<kid>.json` in the vault, with content `{ "platform": "ios", "createdAt": "<iso>" }`:
- `POST /upload-key` writes the file through `github()` with the session, then seals. No file, no key.
- `POST /ingest` already fetches the tree for dedupe, so the registry check is `index.paths.has('.gitvault/keys/<kid>.json')`, with **zero extra calls**. A revoked key gets 401 "Upload key revoked", which the Shortcut shows.
- Revoke = delete that file from the page, via a new generic `DELETE /gh-repo-contents` (D7). It takes effect on the next request.

Why a registry instead of an `iat` max age or a cutoff file:
- A daily automation must not silently die after a year, which is what expiry would do.
- Users understand "connected devices with a Revoke button": every API-token UI looks like that.
- The registry also answers "is my phone connected?" from any browser, which no storage-less design can.

`iat` stays in the payload, so a max age can be added later in one line. A finer-grained token scope isn't possible: OAuth App tokens are `repo`-scoped, and converting to a GitHub App for 1-hour installation tokens is out of scope.

Threat model:
1. **Key leaks** (lost phone, screenshot): the holder can only write files under `Photos/` of that vault. No read, no delete, no other repo. Fix: revoke from the page or revoke the OAuth app.
2. **`NUXT_SESSION_PASSWORD` leaks**: an attacker who also holds a key decrypts a full `repo`-scope token. Same blast radius as today's sealed session cookies. Fix: rotate the password, which kills everything.
3. **Server compromise**: already total today, unchanged.
4. **Unauthenticated hits on `/ingest`**: one failed AES-GCM decrypt, no GitHub call.
5. **The registry file** is a hidden marker, not a secret: deleting the vault or the folder revokes.

UI copy under the device list: "Revoking stops uploads from that device within a minute. You stay signed in. To cut off everything at once, revoke GitVault under GitHub Settings → Applications."

### D6. Visibility of automatic backups: derive from commits with a message marker
- Ingest commits with `BACKUP_COMMIT_MESSAGE = 'feat: phone backup'`. The browser queue keeps `feat: upload file`.
- New `GET /gh-repo-commits?repo&path=Photos&since=<30 days ago>`: one GitHub call, `per_page=100`.
- The page filters by message and shows the latest commit date (`useTimeAgo` from `@vueuse/core`, already installed) and the count in the last 24 h.
- The Shortcut's own notification on the phone adds to this.

No file writes, no DB, no extra ingest cost. What this does not show is whether the automation is *scheduled*. The `stale` state covers that: "nothing arrived for N days, check the automation".

### D7. Code merge strategy: merge #37 (lightly amended), close #39, two stacked PRs on top
**#37 (B):** push one 10-line commit (i18n namespace `galleryBackup` → `phoneBackup`, label "Phone backup", `useHead` title), then **merge as-is**. It ships on its own (manual backup works) and ~90 % of its code survives.

**#39 (C):** close as "superseded by PR A". Its cap, dedupe, folder picker, modal, user-menu entry and UTC rule all change. What survives is cherry-picked into PR A: seal/unseal + tests, the `ingest` skeleton, `github({ auth })`, the README steps.

New PRs, stacked:

| PR | Branch | Content | Steps | Size |
|---|---|---|---|---|
| A | `feat/phone-backup-server` | Server + shared utils. Reviewable without UI, testable with curl. | 1–4 | ~380 lines |
| B | `feat/phone-backup-page` | Page section, composable, i18n, shortcut assets | 5–9 | ~330 lines |
| C | `feat/phone-backup-status` | Commits route, status line, README, context | 10–12 | ~150 lines |

What survives, changes or goes:
- **Kept from #37:** page, picker, result list, `upload(files, getPath)`, blob sha + tests, ADR.
- **Kept from #39:** `sealUploadKey`/`unsealUploadKey` + tests, `isPathSegment` export, `github()` `auth` option, `ingestFilesSchema`, the `upload-key` vault check, README structure.
- **Changed:** cap, dedupe, date rule, folder, payload (`kid`), no modal.
- **Dropped:** `UploadKeyModal.vue`, user-menu item, folder field, `MAX_INGEST_BYTES`, `getIngestPath`, `src/utils/galleryBackup.ts`, `src/utils/withCopyNumber.ts`.

### D8. Keep the screen awake during "Back up now"
Mobile browsers suspend JS when the screen locks. Use `navigator.wakeLock?.request('screen')` (Safari iOS ≥ 16.4, Chrome Android) while the queue has pending items, and release it afterwards. One `try/catch` in `backup.vue` plus the "keep this page open" hint. Native platform feature, no dependency.

### D9. Hide `.gitvault/` from listings
- `EXCLUDE_FILES = ['.gitkeep', '.gitvault']`, and filter folders too in `[...path].vue`.
- `VaultSearch.vue` passes the full `item.path` to `isFileExcluded` (which already matches substrings) instead of the last segment.

This hides it from listings only; it is not a security measure.

---

## Steps

### PR 0: amend and merge #37 (0.5 h)
- Files: `src/locales/en-US.json`, `src/pages/[repo]/backup.vue`, `src/layouts/default.vue`.
- Rename `galleryBackup.*` → `phoneBackup.now.*` (`pick`, `new`, `backedUp`, `tooLarge`, `error`). `phoneBackup.title` = "Phone backup", icon `i-mdi-cellphone-arrow-down`.
- ~10 lines changed. Merge.

### PR A, Step 1: `shared/utils/backup.ts` + tests (2 h)
- New `shared/utils/backup.ts` (~70 lines) with the exports in D2:
  - move `gitBlobSha` from `src/utils/galleryBackup.ts`;
  - move `withCopyNumber` from `src/composables/useVaultContents.ts`;
  - add `yearMonthOf`, `parseTakenAt`, `getBackupPath`, `indexTree`, `placeFile`.
- New `shared/utils/backup.test.ts` (~70 lines):
  - B's `git hash-object` fixture;
  - `withCopyNumber`: `a.txt` → `a (1).txt`, no extension, nested path;
  - `parseTakenAt('2026-10-31T23:30:00+01:00')` → `{2026, 10}`, garbage → undefined;
  - `placeFile`: exists, tooLarge, upload, clash → `(1)` then `(2)`, batch dedupes against itself by sha, index is mutated.
- Delete `src/utils/galleryBackup.ts` and its test. `src/config.ts` loses `MAX_UPLOAD_BYTES`.
- `useVaultContents.ts` and `backup.vue` import from shared. They keep compiling and behave the same until Step 6.

### PR A, Step 2: `github()` auth option, DELETE route, tree helper (1 h)
- `server/utils/github.ts` (~12 lines): C's `auth?: { login, token }` option and `isPathSegment` export. The `method` union gains `'DELETE'`.
- New `server/routes/gh-repo-contents/index.delete.ts` (~8 lines): `vaultRepoQuerySchema` plus body `fileSchemaDelete = z.object({ message: z.string(), sha: z.string() })`. The schema goes in `server/resources/gitHubRepoContents.ts` (~8 lines), typed from octokit's `DELETE /repos/{owner}/{repo}/contents/{path}` params.
- New `server/utils/repoTree.ts` (~12 lines): `getRepoTree(event, repo, auth?)` → `GET /git/trees/{ghDefaultBranch}?recursive=1`. Returns `tree`, or `[]` on 409 (empty repo). Used by ingest; the `gh-repo-tree` route is untouched.
- `src/composables/useVaultContents.ts` (~8 lines): `remove(path, sha)` via `runOperation('delete-' + path, …)`.
- `useVaultContents.test.ts` (~25 lines): tests for `remove` and for `upload(files, getPath)`. B added that parameter without a test.

### PR A, Step 3: upload key issue + registry (1.5 h)
- `server/utils/uploadKey.ts`: keep seal/unseal. The payload schema gains `kid: z.string()`. Drop `getIngestPath`.
- `uploadKey.test.ts`: the payload fixture gains `kid`.
- `server/resources/uploadKey.ts` (~25 lines):
  - `uploadKeySchemaPost = z.object({ repo, platform: z.enum(['ios','android','other']) })`, with no `folder`;
  - `UploadKeyResponse = { key: string, kid: string }`;
  - keep `ingestFilesSchema`, remove `MAX_INGEST_BYTES`;
  - add the `UploadKeyRecord = { platform, createdAt }` type, shared with the client page.
- `server/routes/upload-key/index.post.ts` (~30 lines):
  1. Validate the body.
  2. `GET /repos/{owner}/{repo}` + `isVaultRepo` (from C).
  3. `kid = crypto.randomUUID().replaceAll('-', '')`.
  4. `PUT contents ${UPLOAD_KEYS_DIR}/${kid}.json` with `message: 'chore: add phone upload key'` and the base64 JSON record.
  5. Seal `{ v: 1, kid, iat, login, token, repo: ghRepo.name, folder: BACKUP_FOLDER }` and return `{ key, kid }`.

### PR A, Step 4: `POST /ingest` with tree dedupe + registry check (2 h)
`server/routes/ingest/index.post.ts` (~65 lines, rewrite of C's):
1. Bearer → `unsealUploadKey`, else 401.
2. `content-length` missing → 411. Over `MAX_UPLOAD_BYTES + 16 KiB` → 413, with a `statusMessage` naming the limit.
3. `readMultipartFormData` → file parts via `ingestFilesSchema`, plus the optional text part `taken`.
4. `index = indexTree(await getRepoTree(event, auth.repo, auth))`. If `!index.paths.has(`${UPLOAD_KEYS_DIR}/${auth.kid}.json`)` → 401 'Upload key revoked'.
5. `ym = parseTakenAt(taken) ?? yearMonthOf(new Date())`. Then, for each part, one at a time (keep the `// ponytail:` comment):
   - `sha = await gitBlobSha(new Blob([data]))`;
   - `placeFile(index, { target: getBackupPath(auth.folder, filename, ym), sha, size: data.length })`;
   - `exists` → skipped; `tooLarge` → tooLarge; `upload` → `github(event, contentsUrl(path), { method: 'PUT', body: { content: base64, message: BACKUP_COMMIT_MESSAGE }, auth })` → uploaded.
6. Return `{ uploaded: string[], skipped: string[], tooLarge: string[] }`.

The pure logic lives in `shared/utils/backup.ts` (tested in Step 1); the handler only wires it together. Verify locally with a key sealed from a script, as C's PR did, and curl.

### PR B, Step 5: `useUploadKeys` composable (1.5 h)
New `src/composables/useUploadKeys.ts` (~70 lines), following DESIGN-PATTERNS "mutations live in composables":
- `keys`:
  1. `useFetch('/gh-repo-tree', { query: { repo } })` → paths under `UPLOAD_KEYS_DIR`.
  2. For each: `$fetch('/gh-repo-contents', { query: { repo, path } })` → `decodeBase64Utf8` → `{ kid, sha, platform, createdAt }`. N ≤ 3 in practice.
  3. 409 (empty repo) → `[]`.
- `create(platform)`: `runOperation('upload-key', …)` → `$fetch('/upload-key', { method: 'POST', body: { repo, platform } })` → returns `{ key, kid }` and refreshes `keys`.
- `revoke(kid)`: `useVaultContents().remove(`${UPLOAD_KEYS_DIR}/${kid}.json`, sha)`, with the sha from the tree (no extra GET), then refreshes.
- `ingestUrl = new URL('/ingest', useRequestURL()).toString()`.
- `iosConnectUrl(key)`: builds the `shortcuts://` link. Pure, 3 lines, unit-tested in `useUploadKeys.test.ts` (~20 lines) with `registerEndpoint` like `useVaultContents.test.ts`.

### PR B, Step 6: page: automatic section, wake lock, tree-based plan (3 h)
`src/pages/[repo]/backup.vue` (~220 lines total, +100 vs B):
- **"Back up now":**
  - Replace `planGalleryBackup` with a 10-line loop over `placeFile`, using `indexTree` of the fetched tree.
  - Keep B's result list and call `upload(newFiles, file => planned.get(file)!)`.
  - Wake lock while `uploads` has pending items (D8). Hint `phoneBackup.now.keepOpen`.
- **"Automatic daily backup"** card as in D1:
  - Device rows with Revoke (`UButton color="neutral" variant="outline"`).
  - `UTabs` iPhone/Android with the step lists from D3.
  - iOS "Connect" button: `create('ios')`, then `location.href = iosConnectUrl(key)`.
  - Android "Generate key": `create('android')`, then C's readonly `UInput` with a `useClipboard` copy button and the warning `UAlert` (reuse C's markup, ~30 lines).
- Default platform: `/iPhone|iPad/.test(navigator.userAgent) ? 'ios' : 'android'`.
- Footnote `phoneBackup.footnote` with `formatBytes(MAX_UPLOAD_BYTES)` and `BACKUP_FOLDER`.

### PR B, Step 7: constants + hide `.gitvault` (0.5 h)
- `src/config.ts`:
  - `IOS_SHORTCUT_NAME = 'GitVault Backup'`
  - `IOS_SHORTCUT_URL = 'https://www.icloud.com/shortcuts/<id>'`: the owner fills it after Step 9; until then the button is rendered disabled
  - `ANDROID_SHORTCUT_ZIP = '/phone-backup/gitvault-android.zip'`
  - `HTTP_SHORTCUTS_PLAY_URL`
  - `HTTP_SHORTCUTS_IMPORT_URL = 'https://http-shortcuts.rmy.ch/import?url='`
  - `EXCLUDE_FILES` gains `'.gitvault'`
- `src/pages/[repo]/[...path].vue`: filter folders with `isFileExcluded` (1 line).
- `src/components/VaultSearch.vue`: pass `item.path` (1 line).

### PR B, Step 8: i18n (0.5 h)
`src/locales/en-US.json`, namespace `phoneBackup` (~45 keys):
- `title`, `description`, `footnote`
- `now.{title,description,pick,keepOpen,new,backedUp,tooLarge,error}`
- `auto.{title,description,last,never,stale,devices,since,revoke,revokeHelp,openOnPhone}`
- `auto.device.{ios,android,other}`
- `auto.ios.{add,connect,connectHelp,automate,automateSteps}`
- `auto.android.{install,import,generate,paste,share}`
- `auto.key.{label,shownOnce,copy,warningTitle,warning}` (C's texts)

Delete `uploadKey.*` (C) and `galleryBackup.*` (renamed in PR 0). The message schema is typed from this file, so a missing key fails typecheck.

### PR B, Step 9: the owner builds and publishes the shortcuts (owner, 1.5 h)
- **iOS:** build "GitVault Backup" as in D3 on an iPhone and test it against a deploy preview. Then Share → Copy iCloud Link → set `IOS_SHORTCUT_URL`. Document the action list in the README so it can be rebuilt.
- **Android:** build "GitVault" in HTTP Shortcuts as in D3. Settings → Import/Export → Export, leaving out the `gitvault_key` value. Commit the zip to `public/phone-backup/gitvault-android.zip`.
- **Check:** how HTTP Shortcuts behaves when several photos are shared at once (one request with many parts, or one run per file). If it is one request, the README says "share a few at a time" and the ingest 413 message explains why.

### PR C, Step 10: commits route (1 h)
- New `server/resources/gitHubRepoCommits.ts` (~6 lines): `GhRepoCommitsResponseData` from octokit `GET /repos/{owner}/{repo}/commits`, and the query schema `vaultRepoQuerySchema.extend({ since: z.string().datetime().optional() })`.
- New `server/routes/gh-repo-commits/index.get.ts` (~8 lines): `github(event, owner => `/repos/${owner}/${repo}/commits`, { query: { path, since, per_page: '100' } })`.
- New `src/resources/BackupRuns/parse.ts` (~15 lines) + test (~20 lines): `parseBackupRuns(commits, now) → { lastAt?: string, countLast24h: number }`, keeping only commits where `commit.message === BACKUP_COMMIT_MESSAGE`.

### PR C, Step 11: status line on the page (1 h)
`backup.vue` (~25 lines): `useFetch('/gh-repo-commits', { query: { repo, path: BACKUP_FOLDER, since } })` → `parseBackupRuns` → `useTimeAgo(lastAt)`. States: `never`, `last`, `stale` (more than 48 h ago and keys exist).

### PR C, Step 12: README + context (1 h)
- `README.md` § "Upload your phone gallery", C's section rewritten: the page, the two modes, the iOS action list (rebuild instructions), the Android export recipe, the Tasker note, a curl test, and a security/revoke paragraph.
- `context/architecture/ARCHITECTURE.md`: routes line (`upload-key`, `ingest`, `gh-repo-commits`, `gh-repo-contents` DELETE) and a page line for `backup.vue`.
- `context/architecture/decisions.jsonl`: one ADR superseding B's ADR on the same topic, covering shared dedupe on both paths, the key registry in `.gitvault/keys`, and commits as the backup log.
- `context/design-patterns/docs/github-api.md`: C's `auth` exception, DELETE needs `sha`, `.gitvault` is hidden.
- `context/glossary/GLOSSARY.md`: "Upload key", "Backup folder", "`.gitvault/`".
- `context/design-patterns/DESIGN-PATTERNS.md` § Composables: "`shared/utils/` holds pure logic used by both app and server".

**Total ≈ 17 h:**

| Part | Hours |
|---|---|
| PR 0 | 0.5 |
| PR A | 6.5 |
| PR B | 7 |
| PR C | 3 |
| Owner's shortcut work | 1.5 |

---

## Risks
- **iOS background budget.** Time-of-Day automations run in the background, and long runs (hundreds of photos, one per request) can be suspended. The 2-day window and the daily cadence keep batches small; the `stale` state and "Back up now" are the fallback. This can't be fixed from our side.
- **HEIC vs JPEG.** Safari's picker may convert HEIC to JPEG while the Shortcut sends the original HEIC, so the same photo can be stored twice in two formats. Content dedupe cannot see it. Documented limit.
- **Tree per request** grows with vault size (GitHub truncates at 100k entries / 7 MB). A `ponytail:` comment marks the upgrade path (list the month folder instead).
- **Netlify 502 instead of 413** for bodies between our 413 check and the real limit. Only reachable by hand; the README explains it.
- **`/<repo>/backup` hides a root folder named `backup`.** Inherited from B, same as `file`.
- **Shortcut link rot.** iCloud links are snapshots, so the constant must be updated on every shortcut edit. The README says so.
- **Multiple vaults.** The iPhone config holds one vault; connecting another overwrites it. The page says "this iPhone backs up to {repo}".
- **HTTP Shortcuts multi-file share** may exceed the per-request cap. Check in Step 9.

## Test plan
**Unit (`pnpm unit`):**
- `shared/utils/backup.test.ts`: sha vs `git hash-object`, copy numbering, `parseTakenAt`, the `placeFile` matrix
- `server/utils/uploadKey.test.ts`: round trip, tamper, wrong secret, garbage, `kid`
- `src/composables/useVaultContents.test.ts`: `upload` with `getPath`, `remove`
- `src/composables/useUploadKeys.test.ts`: list from tree + contents, create → POST body, revoke → DELETE with sha, `iosConnectUrl` encoding
- `src/resources/BackupRuns/parse.test.ts`
- Plus `pnpm typecheck` and `pnpm lint`.

**Local curl** (dev server, with a key from the Android tab or a sealing script). Base command:
`curl -F file=@a.jpg -F taken=2026-10-31T23:30:00+01:00 -H "Authorization: Bearer $KEY" localhost:3000/ingest`

| Case | Expected |
|---|---|
| First upload | `{ uploaded: ['Photos/2026/10/a.jpg'] }` |
| Same request again | `skipped` |
| Same bytes sent as `b.jpg` | `skipped` (content dedupe) |
| Different bytes sent as `a.jpg` | `Photos/2026/10/a (1).jpg` |
| No `taken` field | Current month |
| 5 MB file | 413 |
| No key, or garbage key | 401 |
| After Revoke on the page | 401 "Upload key revoked" |
| `/upload-key` without session | 401 |
| `/upload-key` with a non-vault repo | 400 |

**iPhone (deploy preview):**
1. Vault → Phone backup → Back up now → pick 3 photos → the queue uploads 3 → they appear in `Photos/YYYY/MM/` on GitHub.
2. Pick the same 3 → "3 already backed up". Pick a video over 4 MB → listed as skipped.
3. Lock the screen mid-upload → uploads continue (wake lock).
4. Add the shortcut → Add Shortcut. Back in Safari → Connect this iPhone → "Open in Shortcuts?" → allow Photos and the host → notification with counts. The page shows "iPhone · since today".
5. Create an automation 2 minutes ahead with Run Immediately → lock the phone → the status line shows "Last automatic backup 1 minute ago".
6. Revoke → run the shortcut by hand → its notification shows the 401 → the page shows no device.

**Android (deploy preview):**
1. Back up now as above (Chrome).
2. Install HTTP Shortcuts → Import button → the shortcut appears.
3. Generate key → paste it in Variables.
4. Gallery → share 1 photo → the file appears in `Photos/YYYY/MM/`. Share the same photo → nothing new.
5. Share 3 photos → check whether HTTP Shortcuts sends one request or several.

**Can't be tested locally:**
- Netlify's real body limit and 502 behaviour
- iOS unattended automation timing and background suspension
- HEIC conversion in Safari's picker
- the HTTP Shortcuts import deep link (needs the zip on a public URL, so a deploy preview)

## Open questions (default in bold)
1. Should the daily iOS shortcut include videos? **No: `Media Type is Image`. Nearly all videos exceed 4 MB and would only add skipped noise. "Back up now" still accepts them.**
2. Ship iOS-first and leave Android daily automation as a README Tasker recipe? **Yes. Android gets share-to-shortcut + "Back up now".**
3. Base folder fixed to `Photos`, with no setting? **Yes. Add a setting only if someone asks; it would need a storage decision.**
4. Key expiry on top of the registry? **No. Revoke from the page; `iat` stays in the payload for a one-line max age later.**
5. Shortcut window "last 2 days" (survives a missed night, doubles the no-op traffic) or "last 1 day"? **2 days.**

## Review notes (added after the plan)
- **The key is stored in plaintext on the iPhone** (`iCloud Drive/Shortcuts/GitVault/config.json`), so it syncs to iCloud and to every device on that Apple ID. This adds to threat model point 1: anyone with access to the iCloud account can use the key. It is acceptable because the key can only write under `Photos/` and can be revoked. The UI must say so in the warning under "Connect this iPhone".
- **The key also travels in the `shortcuts://` URL.** It does not end up in Safari history (custom scheme), but it is visible to anything that logs URL opens. Same mitigation: narrow scope plus revoke.
