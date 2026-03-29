# Multi-File Upload Plan

## Goal
Allow users to select and upload multiple files at once.

## Pre-requisites
- Complete **01-nuxt4-migration.md**, **02-structure-review.md**, and **03-testing.md** first

---

## Current behavior (full trace)

### Upload composable: `src/composables/useUploadFile.ts`
1. `useFileDialog({ multiple: false })` from `@vueuse/core` opens native file picker
2. `onChange` callback receives `FileList`, uses only `files[0]`
3. `convertFileToBase64(file)` — converts via `Uint8Array` → `String.fromCharCode` → `btoa()`
4. `createFilePath(queryPath, fileName)` — concatenates query path and file name
5. Constructs body: `{ content, message, sha? }` (sha only for replace mode)
6. Shows loading toast with ID `uploading-${path}`, timeout `0` (stays visible)
7. Calls `$putFile({ path, body, repo })` from `src/resources/CDNFiles/api.ts`
8. On success: updates toast (green, 3000ms), calls `refreshNuxtData()`
9. On error: updates toast (red, 3000ms) with server error message

### UI triggers (3 locations):
- **`src/components/CreateItemsDropdown.vue`** (line 36-38): New file upload — `useUploadFile({ multiple: false })`
- **`src/pages/[repo]/[...path].vue`** (line 70): Empty folder upload button — `useUploadFile({ multiple: false })`
- **`src/components/FileCard/Menu.vue`** (line 43): Replace existing file — `useUploadFile` with `replace` option (includes `path` and `sha`)

### Server: `server/routes/gh-repo-contents/index.put.ts`
- Validates body with `fileSchemaPut` Zod schema
- Forwards to `PUT https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- One file per request (GitHub API constraint)

---

## Step 1: Enable multi-file selection in `useFileDialog`

**File:** `app/composables/useUploadFile.ts`

Pass `multiple: true` to `useFileDialog`:

```ts
const { onChange, reset, ...rest } = useFileDialog({
  multiple: true,  // allow selecting multiple files
  ...options?.value,
})
```

## Step 2: Process all selected files in parallel

**File:** `app/composables/useUploadFile.ts`

Replace the single-file `onChange` handler with a multi-file version:

```ts
onChange(async (fileList) => {
  if (!fileList?.length || !repo || Array.isArray(repo)) return

  const files = Array.from(fileList)

  // Show a single "uploading N files" toast
  const toastId = `uploading-batch-${Date.now()}`
  toast.add({
    id: toastId,
    title: t('uploadingFiles', { count: files.length }),
    timeout: 0,
    icon: 'i-mdi-loading',
    ui: {
      icon: { base: 'animate-spin' },
    },
  })

  try {
    // Upload all files in parallel
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const path = createFilePath(queryPath.value, file.name)
        const body: GhRepoContentsRequestParams = {
          content: await convertFileToBase64(file),
          message: `Upload ${file.name}`,
        }
        return $putFile({ path, body, repo })
      })
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    if (failed === 0) {
      toast.update(toastId, {
        title: t('allFilesUploaded', { count: succeeded }),
        color: 'green',
        timeout: 3000,
        icon: 'i-mdi-check',
        ui: { icon: { base: 'animate-none' } },
      })
    } else {
      toast.update(toastId, {
        title: t('someFilesFailedUpload', { succeeded, failed }),
        color: 'orange',
        timeout: 5000,
        icon: 'i-mdi-alert-outline',
        ui: { icon: { base: 'animate-none' } },
      })
    }

    refreshNuxtData()
  } catch (error) {
    let errorMessage = t('errorMessage')
    if (error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string') {
      errorMessage = error.statusMessage
    }
    toast.update(toastId, {
      title: errorMessage,
      color: 'red',
      timeout: 3000,
      icon: 'i-mdi-alert-outline',
      ui: { icon: { base: 'animate-none' } },
    })
  } finally {
    reset()
  }
})
```

## Step 3: Handle the "replace" mode

The current `replace` option (used for replacing a single existing file) only makes sense for one file. Keep single-file replace behavior when `options.value.replace` is set:

```ts
onChange(async (fileList) => {
  if (!fileList?.length || !repo || Array.isArray(repo)) return

  // If replacing, use single-file mode (only first file)
  if (options?.value?.replace) {
    await uploadSingleFile(fileList[0])
    return
  }

  // Otherwise, multi-file upload
  await uploadMultipleFiles(Array.from(fileList))
})
```

Extract the current single-file logic into `uploadSingleFile()` and the new logic into `uploadMultipleFiles()` for clarity.

## Step 4: Add i18n translation keys

**File:** `app/locales/en.json` (and other locale files)

```json
{
  "uploadingFiles": "Uploading {count} file(s)...",
  "allFilesUploaded": "{count} file(s) uploaded successfully",
  "someFilesFailedUpload": "{succeeded} uploaded, {failed} failed"
}
```

## Step 5: Update UI to indicate multi-file support

### Upload button/area
If there's an upload button or area in the UI, update its label or tooltip to indicate that multiple files can be selected.

### Consider a drag-and-drop zone (optional enhancement)
For a better UX, add a drop zone on the folder page that accepts dragged files. This can be done with `@vueuse/core`'s `useDropZone`:

```ts
import { useDropZone } from '@vueuse/core'

const dropZoneRef = ref<HTMLElement>()
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files) uploadMultipleFiles(Array.from(files))
  },
})
```

This is optional and can be done as a follow-up.

---

## Files to modify (summary)

| File | Change |
|------|--------|
| `app/composables/useUploadFile.ts` | Multi-file selection, parallel upload, batch toast |
| `app/locales/en.json` | Add translation keys for multi-file messages |
| `app/locales/*.json` | Add translations for other languages |

## No server changes needed
The server endpoint (`PUT /gh-repo-contents`) handles one file per request. Multi-file upload is achieved by making multiple requests from the client.

**Sequential vs parallel:** The plan uses `Promise.allSettled` (parallel). This is faster but GitHub may return conflicts if multiple commits hit the same branch simultaneously. If this causes issues, switch to sequential `for...of` loop. Test with 5-10 files to verify.

## Edge cases to handle
- **File size limit**: GitHub Contents API limits files to 100MB (recommended <50MB). Add client-side validation.
- **Duplicate names**: If a file already exists and no `sha` is provided, GitHub returns 422. Let it fail per-file — the batch toast will show the failure count.
- **Empty selection**: Already handled by `if (!fileList?.length) return`.

## Verification

```bash
pnpm run typecheck
pnpm run unit
pnpm run dev
```

### Manual test checklist:
- [ ] File picker allows selecting multiple files
- [ ] All selected files are uploaded
- [ ] Single toast shows progress for the batch
- [ ] Success toast shows count of uploaded files
- [ ] Partial failure shows count of succeeded/failed
- [ ] Total failure shows error message
- [ ] Replace mode still works with single file
- [ ] Files appear in the correct folder after upload
- [ ] Page data refreshes after upload completes
