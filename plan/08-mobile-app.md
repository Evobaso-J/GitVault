# Mobile App Plan (Capacitor): automatic nightly phone-gallery backup

## Status (2026-11-02)
Proposed, nothing built. Written against `main` plus PR #39 (`feat/gallery-ingest-key`), which is the reference for the rules the app must follow (`shared/utils/backup.ts`).

Phases, in order:
1. **Spike** (1.5 days): prove the four unknowns before committing (bundled Nuxt app in Capacitor, direct GitHub calls from the shell, device-flow login, large PUTs).
2. **Android app** (~6 days): sideloaded APK. This is where unattended nightly backup actually works.
3. **iOS app** (~4 days + Apple account + a macOS upgrade): backup on app open, plus best-effort overnight runs. Honest about what iOS allows.
4. **Later, not planned here**: Play Store, App Store, videos over the cap (LFS or chunking).

PR #39 ships independently (D6); the app does not use `/ingest`.

## Goal
A GitVault app for Android and iOS that backs up new photos from the phone's gallery to `Photos/YYYY/MM/` of one vault, without the user opening anything, under the same rules as the web ("Back up now") and the shortcut (`/ingest`) paths: same folder, same month rule, same content dedupe, same clash rule. Everything else in the app is the existing web UI, unchanged.

Why native at all: no web or PWA API can read the gallery in the background on either platform, and a `POST /ingest` through Netlify caps files at 4 MiB (plan 07, D4). A native app reads the gallery with the platform APIs and uploads straight to GitHub, so Netlify leaves the path.

## Pre-requisites and hard limits (taken as given)

**Toolchain** ([Capacitor 8 environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)):
- Node 22+ (`.nvmrc` is fine), Android Studio 2025.2.1+, Android SDK API 24+ for the minimum; latest stable is Android 16 (API 36).
- **Xcode 26 is required**, and Xcode 26.0–26.3 need **macOS 15.6+** ([Apple Xcode requirements](https://developer.apple.com/xcode/system-requirements)). The owner's Mac runs macOS 14.5 today: the iOS phase needs a macOS upgrade first. Android development does not.

**GitHub** (every call from the app goes to `api.github.com`):
- REST API has CORS `*` for any origin ([docs](https://docs.github.com/en/rest/using-the-rest-api/using-cors-and-jsonp-to-make-cross-origin-requests)); the OAuth endpoints on `github.com/login/*` do **not**, so the device-flow calls must leave the WebView through native HTTP (D1).
- Primary limit 5,000 requests/hour per user. Secondary: **no more than 80 content-generating requests per minute and 500 per hour**, 100 concurrent, 900 points/minute (writes cost 5) ([rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)); best practice is serial requests with **at least one second between writes** ([best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)). One PUT = one file, so **a backlog of N photos takes at least N/450 hours**. This shapes D3's pacing and the "since" default.
- Files: Git warns over 50 MiB and **blocks over 100 MiB**; repos should stay **under 1 GB, 5 GB strongly recommended** ([about large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)). The Contents API documents 100 MB only for GET; **no size is documented for PUT** ([contents](https://docs.github.com/en/rest/repos/contents)); "Get a blob" supports up to 100 MB ([blobs](https://docs.github.com/en/rest/git/blobs)). Spike item.
- Recursive tree: **100,000 entries / 7 MB, then `truncated: true`** ([trees](https://docs.github.com/en/rest/git/trees)).
- Git LFS free quota: **10 GiB storage + 10 GiB bandwidth/month** on Free/Pro ([LFS billing](https://docs.github.com/en/billing/concepts/product-billing/git-lfs)). Later phase only.
- OAuth Apps: device flow exists, must be **enabled in the app's settings**, 8-character code, 15-minute expiry, 5 s polling, **no `client_secret`**; the web flow's token exchange requires `client_secret` even with PKCE; tokens don't expire unless the app opts in ([authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)).

**Android**:
- WorkManager periodic work: **15-minute minimum interval**; constraints `UNMETERED`, `RequiresCharging`, `BatteryNotLow`, `DeviceIdle` ([define work](https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work)). A plain worker is stopped after **10 minutes**; long-running workers need a foreground service with a declared type on Android 14+, and on Android 16 those can exhaust the job quota ([long-running workers](https://developer.android.com/develop/background-work/background-tasks/persistent/how-to/long-running)); `dataSync` services get **6 hours per 24 h** on Android 15+ ([behavior changes](https://developer.android.com/about/versions/15/behavior-changes-15)). So: plain workers, chunked runs (D3).
- Play: **$25 one-time** ([registration](https://support.google.com/googleplay/android-developer/answer/6112435)); personal accounts created after 13 Nov 2023 must run a **closed test with 12 testers for 14 days** before production ([Play Console help](https://support.google.com/googleplay/android-developer/answer/14151465)); new apps must **target API 36 from 31 Aug 2026** ([target SDK](https://developer.android.com/google/play/requirements/target-sdk)); `READ_MEDIA_IMAGES/VIDEO` need the **Photo and Video Permissions declaration**, allowed when broad access is the core function ([policy](https://support.google.com/googleplay/android-developer/answer/14115180)). A backup app qualifies; a picker-only app would not need it.
- **Developer verification for sideloaded apps**: enforced from **30 Sep 2026** in Brazil, Indonesia, Singapore, Thailand, **global in 2027**; a free "limited distribution" account covers up to 20 devices; ADB installs stay possible ([Google](https://support.google.com/android-developer-console/answer/16561738)). Irrelevant for the owner's own phones in 2026; relevant before sharing the APK widely.

**iOS**:
- `BGProcessingTaskRequest`: "a processing task that can take minutes", options `requiresExternalPower`, `requiresNetworkConnectivity`; `BGAppRefreshTaskRequest` is "a short refresh task" ([Apple](https://developer.apple.com/documentation/backgroundtasks/bgprocessingtaskrequest)). The system decides if and when. **iOS 26** adds `BGContinuedProcessingTask`: starts in the foreground, continues in the background with progress in a Live Activity, can be killed under pressure ([Apple](https://developer.apple.com/documentation/backgroundtasks/bgcontinuedprocessingtask)); developers reported it misfiring on the 26.0 release ([forum](https://developer.apple.com/forums/thread/801126)).
- How others cope: Immich's FAQ says iOS decides, and tells users to enable Background App Refresh, disable Low Power Mode and "use the Immich app more often" ([Immich FAQ](https://docs.immich.app/FAQ/)); Nextcloud users report uploads only while the app is open ([forum](https://help.nextcloud.com/t/auto-upload-on-ios/220126)). Nobody has solved this; the honest product promise on iOS is "backs up when you open the app, and overnight when iOS lets it".
- Apple Developer Program **$99/year** ([Apple](https://developer.apple.com/programs/whats-included/)); TestFlight builds last **90 days**, 100 internal / 10,000 external testers, the first external build goes through Beta App Review ([TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)); review guideline **4.2** rejects apps that are "a repackaged website" and **5.1.1(ii)** requires honest purpose strings ([guidelines](https://developer.apple.com/app-store/review/guidelines/)).

**Capacitor**:
- `server.url` is "intended for use with live-reload servers … not intended for use in production"; keep `hostname: localhost`, schemes `capacitor://` (iOS) and `https://` (Android) ([config](https://capacitorjs.com/docs/config)).
- `@capacitor/background-runner` runs JS outside the WebView with only `fetch` (string/JSON bodies), timers, `crypto`, a KV store, notifications; **~30 s on iOS, 10 min on Android, 15-min minimum interval**; no access to other plugins or the photo library ([docs](https://capacitorjs.com/docs/apis/background-runner)). Not usable for gallery backup.
- `CapacitorHttp.post()` can be called directly without patching `window.fetch`; bodies are string or JSON only ([docs](https://capacitorjs.com/docs/apis/http)). Enough for the two device-flow calls.
- Gallery plugins: `@capacitor-community/media` `getMedias` is **iOS only** ([repo](https://github.com/capacitor-community/media)); `@capgo/capacitor-photo-library` (MPL-2.0, iOS + Android, Capacitor 8) pages by offset/limit, has no "since" filter, and reads originals by copying them into the app cache ([repo](https://github.com/Cap-go/capacitor-photo-library)). Neither runs in the background, so neither replaces native code (D3).
- Android `EncryptedSharedPreferences` is deprecated since security-crypto 1.1.0-alpha07; Google points to the Keystore ([migration guide](https://proandroiddev.com/goodbye-encryptedsharedpreferences-a-2026-migration-guide-4b819b4a537a)).

**Not verified, to settle in the spike**: Contents API PUT size ceiling; Capacitor's local server returning `index.html` for deep links on cold start; Nuxt plugin ordering (`enforce: 'pre'`) versus `nuxt-auth-utils`' session fetch; `nuxt generate` with `@nuxt/image` (`AppLogo.vue` uses `NuxtImg`; the [`none` provider](https://image.nuxt.com/providers/none) is the fallback); Apple's free (no program) 7-day signing for dogfooding on the owner's own iPhone.

---

## Decisions

### D1. Auth: GitHub device flow in the app, token in Keychain/Keystore, app talks to GitHub directly

**Recommended.** The app signs in with the OAuth **device flow** against the same OAuth app the web uses (enable "Device flow" in its settings; the client id is public, the secret stays on Netlify). The token goes to the native plugin (`GitVaultBackup.setToken`), which stores it in the **iOS Keychain** (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`, so an overnight task after a reboot can read it once the phone was unlocked) and on Android in `SharedPreferences` encrypted with an **Android Keystore** AES-GCM key (~40 lines, no dependency; `android:allowBackup="false"`). The WebView gets the token from the plugin at startup and keeps it in memory for D2's adapter. **The app never talks to the Netlify server.**

UX: "Sign in with GitHub" → the app shows `WDJB-MJHT` with a copy button and opens `https://github.com/login/device` in the system browser (`@capacitor/browser`) → the user pastes the code and approves → the app polls and lands in the vault list. One-time, 30 seconds. CLI tools (`gh`) do exactly this.

Because `github.com/login/device/code` and `github.com/login/oauth/access_token` have no CORS, the two calls go through `CapacitorHttp.post()`; every `api.github.com` call uses plain `fetch` (CORS `*`).

Alternatives rejected:

| Option | Why not |
|---|---|
| Authorization-code flow in the app (with PKCE) | GitHub still requires `client_secret` at the token exchange: the secret would ship in the APK. |
| OAuth through the Nitro server with a deep-link callback (`gitvault://auth?token=…`) | Needs a new route that hands the raw token to a URL; custom schemes can be claimed by other apps, universal links need hosted association files; and the token would be visible to anything logging URL opens. More parts, weaker. |
| Reuse the upload key from #39 and post to `/ingest` | Keeps Netlify in the path (4 MiB cap, 60 s), keeps the key as a second credential, and the app still needs a session for the rest of the UI. Defeats the reason for going native. |
| Session cookie from the web login | The WebView origin is `capacitor://localhost`; the cookie is `SameSite=Lax` (nuxt-auth-utils default) and third-party to the Netlify host, so it is never sent. |

Consequence for the ADR `adr_20261030_114425_cf4a` ("token never reaches the browser"): it stays true for the web app. The native app is a different trust boundary (one user, their own device, token in the platform keystore); a new ADR records that. Logout = `clearToken()`; revoking the grant is done on GitHub, as today.

### D2. Shell: bundled `nuxt generate` build plus a native-only `$fetch` adapter, no remote URL

**Recommended.** `ssr: false` already makes `nuxt generate` emit a plain SPA in `.output/public` ([Nuxt deployment](https://nuxt.com/docs/3.x/getting-started/deployment)); Capacitor's `webDir` points there. The Nitro server is not in the bundle, so the 7 server routes the UI calls have no server. A **Nuxt client plugin, active only when `Capacitor.isNativePlatform()`**, wraps `globalThis.$fetch` and rewrites those calls to `api.github.com` with the Bearer token. The handlers are 6–8 lines each, so the adapter mirrors them one to one:

| App calls | Adapter sends |
|---|---|
| `GET /api/_auth/session` (nuxt-auth-utils) | `GET /user` → `{ user }`; no token → `null` |
| `DELETE /api/_auth/session` | `GitVaultBackup.clearToken()` |
| `GET /gh-user-repos` | `GET /user/repos`, filtered with `isVaultRepo` |
| `POST /gh-user-repos` | `POST /user/repos` then `PUT …/topics` (mirror of `createVaultRepo`) |
| `GET/PUT/DELETE /gh-repo-contents?repo&path` | same verb on `/repos/{login}/{repo}/contents/{path}` |
| `GET /gh-repo-tree?repo` | `GET …/git/trees/{ghDefaultBranch}?recursive=1` |
| `GET /gh-repo-commits?repo&path&since` | `GET …/commits?path&since&per_page=100` |
| `POST /upload-key` | not reachable in the app (the card is replaced, D7) |

Error mapping copies `github()` (`statusMessage` = GitHub's `message`), so `useOperationToast` keeps working. `isVaultRepo`, `isPathSegment` and the per-segment path encoding move from `server/` to `shared/utils/` so both sides share them; no logic is duplicated except the two-call vault creation (8 lines, commented).

Everything else in the UI is untouched: pages, composables, `useUserSession()` and the `00.auth` middleware keep working against the adapter. `useFetch` with a relative path resolves to the global `$fetch` on the client, which is why wrapping the global is enough (confirm in the spike).

Why not the remote URL (`server.url = https://<prod>`):
- Capacitor says it is not for production; offline the app is a white screen.
- Login would work (first-party cookie inside the WebView), but the native engine needs the raw token, which means a new `GET /native-token` route on the public web server: any XSS in the **web** app could then exfiltrate a `repo`-scope token instead of only making proxied calls. The bundled design keeps the server exactly as it is.
- UI uploads would still go through Netlify (4 MiB).
- Apple 4.2 risk is higher for an app that is visibly a website.

Build: `pnpm generate` is already a script. Add `pnpm app:sync` = `nuxt generate && cap sync`. Netlify keeps `pnpm build`. `android/` and `ios/` are committed at the repo root (Capacitor default), build outputs gitignored.

Known native gaps to accept in phase 1: "Download" uses `<a download>`, which WKWebView ignores → in native, open `download_url` with `@capacitor/browser`; "Copy link" uses `useRequestURL().origin` (= `capacitor://localhost`) → use a `WEB_ORIGIN` constant in `src/config.ts` when native.

### D3. Background engine: one app-local native plugin per platform, the engine itself is native

**Recommended.** A Capacitor plugin `GitVaultBackup` written inside the app projects (no npm package; iOS registers it from a `CAPBridgeViewController` subclass in `capacitorDidLoad()` per [Capacitor custom code](https://capacitorjs.com/docs/ios/custom-code), Android via `registerPlugin()` in `MainActivity`). The scan, hash, dedupe and upload run **in native code**, in the background and in the foreground alike. JS only configures and displays.

```ts
// src/native/backupPlugin.ts
type BackupConfig = { owner: string, repo: string, enabled: boolean, wifiOnly: boolean, chargingOnly: boolean, includeVideos: boolean, since: string }
type BackupStatus = { permission: 'granted' | 'limited' | 'denied' | 'prompt', lastRunAt?: string, lastRun?: { uploaded: number, skipped: number, tooLarge: number, failed: number }, lastError?: string, pending: number }
interface GitVaultBackupPlugin {
  setToken(o: { token: string, login: string }): Promise<void>; getToken(): Promise<{ token?: string, login?: string }>; clearToken(): Promise<void>
  requestPermission(): Promise<{ permission: BackupStatus['permission'] }>
  configure(c: BackupConfig): Promise<void>; getConfig(): Promise<BackupConfig | null>
  runNow(): Promise<BackupStatus>; getStatus(): Promise<BackupStatus>
}
```

Why native, not JS: background execution on both platforms happens outside the WebView. Background Runner cannot see the gallery or other plugins. A JS engine in the WebView would only cover the foreground, so the native code would exist anyway; two engines for one job is the thing to avoid. The rules are small (`shared/utils/backup.ts` is 80 lines): porting them is cheaper than bridging around them. The test vectors in `shared/utils/backup.test.ts` (sha against `git hash-object`, `name (n).ext`, month folder) are ported verbatim to JUnit and XCTest, so the three implementations are proven identical.

**One run, both platforms (`BackupRules` + `BackupEngine`)**:
1. No token, `enabled: false`, permission not granted, or Wi-Fi-only on a metered network → return, no network.
2. List media created after the cursor, oldest first, at most 300 items: Android `MediaStore.Images` (+ `Video` if enabled) where `DATE_ADDED > cursor`; iOS `PHAsset.fetchAssets` with `creationDate > cursor`. Nothing new → return. **This makes idle runs free**, so the cadence can be short.
3. `GET …/git/trees/{branch}?recursive=1` once → sets of blob shas and paths (409 = empty repo). `truncated: true` → `ponytail:` comment, upgrade path is listing `Photos/YYYY/MM` per month instead.
4. Per item: over the cap → `tooLarge`, cursor advances. Otherwise stream SHA-1 over `blob <size>\0` + bytes (iOS reads originals with `PHAssetResourceManager`, HEIC stays HEIC; iCloud-offloaded originals need `isNetworkAccessAllowed`). Sha in the vault → `skipped`. Else `Photos/YYYY/MM/<name>`, `(n)` on a path clash, `PUT contents` with `BACKUP_COMMIT_MESSAGE`, **≥ 1 s between PUTs**. The JSON body is streamed to a temp file and uploaded from it (a 50 MiB file is a 67 MB base64 string; never hold it in memory). Cursor advances after each item, so a killed run resumes where it stopped.
5. 401 → `lastError = 'Sign in again'` and stop; 403/429 → honour `retry-after`, stop, next run continues; network error → retry policy of the scheduler.
6. Month: `DATE_TAKEN` / `creationDate` of the asset, in the phone's time zone (same intent as `parseTakenAt`).

**Scheduling**:
- **Android**: `PeriodicWorkRequest` every **6 h** (flex 1 h), constraints from the config (`UNMETERED` when `wifiOnly`, `RequiresCharging` when `chargingOnly`, `BatteryNotLow` always), `ExistingPeriodicWorkPolicy.UPDATE` on `configure`. 300 items × ~1.5 s stays under the 10-minute worker limit and under 500 writes/hour, so no foreground service, no `dataSync` type, no notification. `runNow` enqueues a one-time expedited request. Reliable: WorkManager runs when constraints hold, which on a charging phone is every night.
- **iOS**: `BGProcessingTaskRequest` with `requiresNetworkConnectivity = true`, `requiresExternalPower = chargingOnly`, `earliestBeginDate` = next 01:00, resubmitted at the end of each run and whenever the app comes to the foreground; `expirationHandler` stops the loop (the cursor makes that safe). Wi-Fi-only is checked with `NWPathMonitor.isExpensive` at run start, since the request has no such option. **Plus: every foreground entry runs the engine** (`appStateChange` from `@capacitor/app` → `runNow()`), covered by `beginBackgroundTask` for the last seconds after the user leaves. This is what Immich and Nextcloud effectively rely on; the page says so in plain words. Phase 3 options: a background `URLSession` so uploads survive expiration, `BGContinuedProcessingTask` on iOS 26 for "Back up now" with system progress.

Defaults: `wifiOnly: true`, `chargingOnly: false`, `includeVideos: false`, **`since` = time of setup**. "Also back up older photos" is an explicit choice that shows the estimate "N photos, at least N/450 hours, runs in the background over the next days" (GitHub's write limit, not ours).

Dedupe with the other paths is by content sha, so the app, the web picker and `/ingest` never store the same bytes twice. Same caveat as plan 07: Safari's picker may turn HEIC into JPEG, the app uploads the original, and those two are different content.

### D4. File size: the cap moves from 4 MiB (Netlify) to 50 MiB (Git's warning line); videos opt-in; LFS and chunking later

**Recommended.** Direct uploads remove Netlify's limit. The remaining ceilings are GitHub's: 100 MiB blocked, 50 MiB warned, undocumented PUT body ceiling (spike: PUT 20, 60 and 95 MB files from `curl`; if 60 MB fails, the cap becomes what passes). `MAX_UPLOAD_BYTES_NATIVE = 50 MiB` lives in the native rules; `shared/utils/backup.ts` keeps `MAX_UPLOAD_BYTES = 4 MiB` for the paths that go through Netlify, with a comment pointing at the other.

Videos: off by default. A one-minute 4K clip is 300–400 MB, so "include videos" means "videos under 50 MB", and the toggle says exactly that.

Repo size: at 3–5 MB per photo a vault passes 1 GB after ~250 photos and the strongly-recommended 5 GB after ~1,200. The page shows the vault's size from `GET /repos/{o}/{r}` (`size`, in KB, one call) with a warning past 4 GB. Switching vaults yearly is a user action, not automation (open question 3).

Not now, evaluated:

| Option | Status |
|---|---|
| Git LFS (10 GiB free) | Batch API + presigned PUT + pointer commit, ~80 native lines, plus the web viewer must resolve pointers (`media.githubusercontent.com`) for preview and download. Phase 4 if videos are asked for. |
| Chunking (`name.part01`…) | Needs join-on-download in the web UI first. Phase 4. |
| Git Data API (blobs + one tree + one commit per run) | Same number of content-generating requests (one blob POST per file), one commit per run instead of per file, but a run that dies mid-way loses the whole batch, and the status line (`gh-repo-commits`) would count runs, not files. `ponytail:` note in the engine; revisit if per-file commits become a problem. |

### D5. Distribution: Android first as a signed APK on GitHub Releases; iOS via TestFlight; stores later

**Recommended.**
- **Android now**: a release keystore (kept in the owner's password manager), `minSdk 24`, `targetSdk 36`, APK attached to a GitHub Release, README section "Install on Android" (allow the browser to install apps). Cost 0, review 0, works today. Before sharing beyond the owner's phones in 2027: register for developer verification (free limited-distribution tier) or publish on Play.
- **Play later**: $25, the 12-testers/14-days gate if the account is personal and new, the Photo and Video permissions declaration ("gallery backup" is the textbook core-function case), target API 36. Worth it only if GitVault wants users who will not sideload.
- **iOS**: Apple Developer $99/year is unavoidable for TestFlight or the App Store. For the owner's own iPhone during development, a free Apple ID signs builds that expire after 7 days (commonly reported, not verified against Apple docs). TestFlight for friends (90-day builds, first external build reviewed). App Store review: the native backup engine is the "app-like" feature 4.2 asks for; the photo permission string must say "to back up new photos to your GitHub vault" (5.1.1(ii)); a privacy policy URL is required (the README already describes the data flow: GitHub only, no GitVault server involved in the app).

### D6. PR #39: merge it as the no-install path; the app does not use it; retire the shortcut only when the iOS app is real

**Recommended.** #39 is finished code that gives iPhone users unattended backup **today**, with no app, no $99, no macOS upgrade. The iOS app is the last phase of this plan and depends on all three. Dropping #39 would leave iPhones with nothing for months.

- Merge #39. Do the owner's iOS shortcut publishing (plan 07, Step 9, iOS half). **Skip the Android HTTP Shortcuts export**: the Android app replaces it within weeks, and that step was never built.
- `shared/utils/backup.ts` becomes the spec the native engines are tested against (D3). `BACKUP_COMMIT_MESSAGE` is shared, so the status line on the backup page counts app runs and shortcut runs alike, on the web and in the app.
- `/ingest` and `/upload-key` stay as they are. Not the app's backend: putting Netlify back in the path would reintroduce the 4 MiB cap and a second credential.
- When the iOS app ships and has run for a month on the owner's phone: decide, in a new plan entry, whether to delete `/ingest`, `/upload-key`, the shortcut assets and the "Automatic daily backup" card from the web. Not before.

### D7. The backup page in the app: one card, the native engine; the shortcut and picker cards are web-only

In the app, `backup.vue` renders (behind `Capacitor.isNativePlatform()`) a single card instead of the two web cards:
- Status line from `getStatus()` (last run, counts, error) **and** the commit-based line already on the page (unchanged, via the adapter).
- Photos permission button when not granted (Android 14 "selected photos" and iOS "limited" show a hint: the backup only sees what was selected).
- Toggles: Automatic backup, Wi-Fi only, Only while charging, Include videos (under 50 MB); "Also back up photos before <setup date>" with the hours estimate.
- "Back up now" → `runNow()` with the engine's counts when done.
- Vault size line (D4).
- iOS only: "iOS runs the backup when you open GitVault and, when it allows, overnight while charging. Keep Background App Refresh on."

The web picker card is hidden in the app: the engine covers "pick old photos" through `since`, and two upload paths on one screen is how users get two copies of the same mistake. i18n keys under `phoneBackup.app.*`.

### D8. Repo layout and what stays untouched

- New: `capacitor.config.ts`, `android/`, `ios/`, `src/native/{backupPlugin.ts, deviceFlow.ts}`, `src/plugins/native-github.client.ts`, `src/components/DeviceFlowSignIn.vue`.
- Moved to `shared/utils/`: `isVaultRepo`, `isPathSegment`, path encoding (server imports follow).
- New public runtime config `NUXT_PUBLIC_GH_CLIENT_ID` (the OAuth client id; public by nature) in `nuxt.config.ts` and `.env.example`. New constant `WEB_ORIGIN` in `src/config.ts`.
- Untouched: `server/`, Netlify build, the web login, every page except `backup.vue` and `login.vue` (native branches only).
- New dependencies: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/browser`, `@capacitor/app`. No community plugin.

---

## Steps

### Phase 0: spike (12 h)
Branch `spike/capacitor`, throwaway. Four questions, one afternoon each at most:
1. `pnpm generate` → `npx cap add android` → `cap sync` → the vault list renders in the emulator with a hardcoded token in the adapter for `/gh-user-repos` and `/api/_auth/session`. Check: deep link reload (`capacitor://localhost/<repo>`) serves `index.html`; `AppLogo` renders (else `image.provider: 'none'`); `enforce: 'pre'` runs before nuxt-auth-utils' session fetch.
2. Device flow with `CapacitorHttp.post()` against the real OAuth app (enable Device flow in its settings).
3. From `curl`: `PUT contents` with 20, 60, 95 MB files into a test vault; record what passes and how long it takes. Sets `MAX_UPLOAD_BYTES_NATIVE`.
4. 20-line Kotlin worker that lists `MediaStore` since a timestamp and logs names: permission prompt, Android 14 partial access, `DATE_ADDED` vs `DATE_TAKEN` semantics.

Outcome: a 10-line note at the top of this file ("Spike results") and go/no-go on D2 and D4 numbers.

### Phase 1: Android (45 h)

**Step 1: Capacitor scaffold (3 h).** `capacitor.config.ts` (`appId`, `webDir: '.output/public'`), `android/` committed, `.gitignore` for `android/app/build`, `android/.gradle`, local keystore. Scripts `app:sync`, `app:android` (`cap open android`). `NUXT_PUBLIC_GH_CLIENT_ID`, `WEB_ORIGIN`. Manifest: `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED`, `INTERNET`, `allowBackup=false`.

**Step 2: shared moves + `$fetch` adapter (8 h).** Move `isVaultRepo`, `isPathSegment`, `encodeRepoPath` to `shared/utils/github.ts`; server files import from there (tests keep passing). `src/plugins/native-github.client.ts`: route table of D2, token from `GitVaultBackup.getToken()`, error mapping. `native-github.test.ts`: table-driven, fake base fetch, asserts URL, method, headers and the `statusMessage` mapping for each row.

**Step 3: sign-in (8 h).** `src/native/deviceFlow.ts`: pure state machine (`requestCode → poll(interval, slow_down, expired) → token`) with tests on fake responses. `DeviceFlowSignIn.vue` (code, copy, "Open GitHub", spinner, retry), shown by `login.vue` in native instead of the `/auth/github` button. Plugin methods `setToken/getToken/clearToken` in Kotlin (`TokenStore.kt`, Keystore AES-GCM). Logout path: adapter `DELETE /api/_auth/session` → `clearToken()`.

**Step 4: Kotlin engine (16 h).** `BackupRules.kt` (blob sha streaming, `withCopyNumber`, `backupPath`, `placeFile`) + `BackupRulesTest` with the vectors from `shared/utils/backup.test.ts`. `BackupWorker.kt` (`CoroutineWorker`, D3 run), `BackupScheduler` (periodic + expedited one-time), `BackupState` (config, cursor, last run, in `SharedPreferences`), `GitVaultBackupPlugin.kt` (methods of D3, permission request via `ActivityResult`). Manual test against a test vault with a 50-photo folder.

**Step 5: backup page, native card (6 h).** D7 card in `backup.vue`, `useNativeBackup` composable wrapping the plugin (status polling while a run is active), i18n `phoneBackup.app.*`, vault size line, download/copy-link native branches in `useFileActions`.

**Step 6: release (4 h).** Release keystore, signed APK, GitHub Release `app-v0.1.0`, README "Install on Android" + "Build the app" (toolchain, `pnpm app:sync`), `cap sync` check that `.output/public` is fresh. **Evaluate context update**: ADR for D1/D2/D3 (supersedes the scope of `adr_20261030_114425_cf4a` for the native shell), `ARCHITECTURE.md` (shell, adapter, plugin), `DESIGN-PATTERNS.md` (`src/native/`, "native branches behind `isNativePlatform()`"), `OPERATIONS.md` (new env var, toolchain, release), `GLOSSARY.md` ("engine", "cursor"), `playbooks.jsonl` for whatever the spike bit us with.

### Phase 2: iOS (32 h, after macOS 15.6+ and the Apple Developer account)

**Step 7: Xcode project (4 h).** `npx cap add ios`, `Info.plist`: `NSPhotoLibraryUsageDescription`, `UIBackgroundModes: processing`, `BGTaskSchedulerPermittedIdentifiers`. `TokenStore.swift` (Keychain). `GitVaultBackupPlugin.swift` registered from `MyViewController.capacitorDidLoad()`.

**Step 8: Swift engine (16 h).** `BackupRules.swift` + `BackupRulesTests` (same vectors). `BackupEngine.swift`: PhotoKit enumeration since cursor, `PHAssetResourceManager` streaming into `CryptoKit.Insecure.SHA1`, body to temp file, `URLSession.uploadTask(fromFile:)`, pacing, cursor. Limited-library handling.

**Step 9: scheduling (6 h).** `BGProcessingTaskRequest` submit/resubmit, `expirationHandler`, `NWPathMonitor` for Wi-Fi-only, foreground trigger from `appStateChange` with `beginBackgroundTask`. Test with the Xcode debugger command `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"…"]`.

**Step 10: TestFlight (6 h).** App Store Connect record, privacy policy page (static, in `public/`), purpose strings, first build to internal testers. Context update as in Step 6.

### Phase 3/4: later, unestimated
Play Store (listing, declaration, closed test), App Store review, background `URLSession` on iOS, `BGContinuedProcessingTask` for "Back up now" (iOS 26), videos over the cap (LFS or chunking, with web-side support first).

**Total committed ≈ 89 h:**

| Part | Hours |
|---|---|
| Phase 0 spike | 12 |
| Phase 1 Android | 45 |
| Phase 2 iOS | 32 |

Plus money and prerequisites: $0 for Android sideload; $99/year + macOS 15.6+ for iOS; $25 for Play if wanted.

---

## Risks
- **iOS background is discretionary.** `BGProcessingTask` may not run for days (Low Power Mode, Background App Refresh off, force-quit app, a phone that is rarely charged while idle). Mitigation is product honesty: foreground runs on every open, the stale warning on the page, and the shortcut path (#39) as the alternative for people who never open the app. Nothing on our side can force it.
- **GitHub's 500 writes/hour** makes a first backup of an existing library slow (8,000 photos ≈ 18 hours of runs spread over days). Default `since = setup` sidesteps it; the opt-in shows the estimate. Secondary-limit 403s are handled with `retry-after`, never retried in a loop.
- **Undocumented PUT size.** If large PUTs fail or time out, the cap drops to what the spike proves, and videos stay out until LFS.
- **Repo size.** A photo vault hits GitHub's 5 GB guidance within a year or two. The page shows the size; the user switches vault. If GitHub starts restricting oversized repos, backups fail loudly (403) and the page says so.
- **Token in the WebView's memory.** An XSS in our own UI could read it. Same code as the web (where XSS can already drive the proxy); the token is never persisted by JS. Acceptable for a single-user app; a new ADR says so.
- **Dedupe cost grows with the vault.** One recursive tree per run with new items; 10k photos ≈ 1.5 MB JSON. Beyond `truncated`, the month-folder listing is the planned upgrade.
- **Keystore corruption on some Android OEMs** is a known class of bug: on decrypt failure the app treats it as signed out and asks to sign in again, never crashes.
- **Toolchain churn.** Capacitor 8 wants Xcode 26 / Android Studio 2025.2; Apple raises floors yearly. Pin versions in `package.json`, note the floors in `OPERATIONS.md`.
- **Two implementations of the rules (Kotlin, Swift) plus the TypeScript original.** Guarded by the shared test vectors; a change to `backup.ts` must update three test files, documented in `DESIGN-PATTERNS.md`.
- **Developer verification (2026–2027).** The APK keeps installing on the owner's devices; sharing it widely after 2027 needs the free limited tier or Play.

## Test plan
**Unit (`pnpm unit`, JUnit, XCTest):**
- `native-github.test.ts`: every row of the D2 table (URL, method, headers, body passthrough, error → `statusMessage`), `/api/_auth/session` with and without token.
- `deviceFlow.test.ts`: happy path, `slow_down` adds 5 s, `authorization_pending` keeps polling, `expired_token` ends with the right message.
- `BackupRulesTest.kt` and `BackupRulesTests.swift`: the vectors of `shared/utils/backup.test.ts` (sha fixture, copy numbers, month path, `placeFile` matrix, batch dedupes against itself). Plus `pnpm typecheck`, `pnpm lint`.

**Android device (owner's phone, test vault):**
1. Install the APK → Sign in → code → GitHub → vault list appears. Kill and reopen → still signed in.
2. Backup page → allow photos (full) → defaults → "Back up now" → nothing (no photos since setup). Take 3 photos → "Back up now" → 3 uploaded, `Photos/YYYY/MM/` on GitHub, status line "Last automatic backup a few seconds ago · 3".
3. Take the same photo twice (screenshot of a static image) → 1 uploaded, 1 skipped. Rename case: upload a photo via the web picker, then take nothing new → skipped by sha.
4. Enable "older photos" → estimate shown → leaves it running → check progress across runs, cursor survives a reboot.
5. Wi-Fi only on, mobile data only → run returns "waiting for Wi-Fi". Charging only on, unplugged → WorkManager holds the work (`adb shell dumpsys jobscheduler`).
6. Overnight on charger → next morning the status line shows the run. Force-stop the app → still runs (WorkManager).
7. Revoke the OAuth grant on GitHub → next run: "Sign in again" in the status, no crash. Sign out → token gone (`getToken()` empty).
8. 60 MB video with "include videos" → either uploads or lands in `tooLarge` with the spike's cap; never a crash or an OOM.

**iOS device (TestFlight):**
1–3 as Android. 4. Background: schedule, lock the phone on a charger overnight → check the morning status; if no run, confirm the simulated launch works, then document "iOS did not run it" as expected behaviour. 5. Limited photo access → hint shown, only selected photos backed up. 6. Open the app after taking photos → upload starts within a second, finishes after backgrounding (short batch).

**Can't be tested locally:** iOS scheduling decisions, Play/App Store review outcomes, Android 16 job-quota behaviour on specific OEMs, GitHub's undocumented limits beyond what the spike measured.

## Open questions (default in bold)
1. Default `since` = setup time, with "older photos" as an explicit opt-in that states the hours estimate? **Yes.**
2. Videos off by default, cap 50 MiB when on? **Yes; LFS/chunking only if asked.**
3. One vault for all photos, with a size warning, versus the app proposing a yearly vault (`gitvault-photos-2027`)? **Warning only; yearly vaults are a user habit, not a feature, until someone hits 5 GB.**
4. Android cadence 6 h with constraints, or 24 h with an initial delay to 02:00? **6 h: idle runs cost nothing, and a missed night is caught up at breakfast.**
5. Play Store at all, or sideload only? **Sideload now; decide on Play when someone who won't sideload asks.**
6. Buy the Apple Developer membership and upgrade macOS now, or after Android proves the engine? **After Android ships; the shortcut path covers iPhones meanwhile.**
7. Retire `/ingest` and the shortcut when the iOS app ships? **Not in this plan; decide after a month of the iOS app on the owner's phone.**
8. Should the web app also call GitHub directly now that an adapter exists? **No. The browser keeps the proxy and the server-side token (ADR cf4a); the app is a different trust boundary.**
