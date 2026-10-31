import type { H3Event } from 'h3'
import type { IngestFile, IngestResponse } from '~~/server/resources/uploadKey'
import { github } from './github'
import { getRepoTree } from './repoTree'
import type { UploadKeyPayload } from './uploadKey'

/**
 * Writes phone files to `Photos/YYYY/MM/` of the vault bound to the upload key, with the rules
 * of `shared/utils/backup.ts`: content already in the vault is skipped (a re-run is harmless),
 * a name clash with different content becomes `name (n).ext`, files over the cap are reported.
 * The month comes from `taken` (the phone's clock) or, without it, from now.
 */
export const ingestFiles = async (event: H3Event, auth: UploadKeyPayload, files: IngestFile[], taken?: string): Promise<IngestResponse> => {
  // ponytail: tree per request; switch to GET contents of the month folder if vaults pass ~50k files
  const index = indexTree(await getRepoTree(event, auth.repo, auth))
  // The registry file is the allow-list: Revoke on the page deletes it, no extra call needed here
  if (!index.paths.has(`${UPLOAD_KEYS_DIR}/${auth.kid}.json`)) throw createError({ statusCode: 401, statusMessage: 'Upload key revoked' })

  const yearMonth = parseTakenAt(taken) ?? yearMonthOf(new Date())
  const result: IngestResponse = { uploaded: [], skipped: [], tooLarge: [] }
  // ponytail: one file at a time; parallel PUTs on one branch make GitHub reject commits with 409
  for (const { filename, data } of files) {
    const target = getBackupPath(filename, yearMonth)
    if (data.length > MAX_UPLOAD_BYTES) {
      result.tooLarge.push(target)
      continue
    }
    const path = placeFile(index, { target, sha: await gitBlobSha(new Blob([new Uint8Array(data)])) })
    if (!path) {
      result.skipped.push(target)
      continue
    }
    await github(event, owner => `/repos/${owner}/${encodeURIComponent(auth.repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'PUT',
      body: { content: data.toString('base64'), message: BACKUP_COMMIT_MESSAGE },
      auth,
    })
    result.uploaded.push(path)
  }
  return result
}
