import { createHash } from 'node:crypto'
import { ingestFilesSchema, MAX_INGEST_BYTES } from '~~/server/resources/uploadKey'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'
import { withCopyNumber } from '~/utils/withCopyNumber'

const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/')

// Same id git gives the blob, comparable with the `sha` of GET contents
const gitBlobSha = (data: Buffer) => createHash('sha1').update(`blob ${data.length}\0`).update(new Uint8Array(data)).digest('hex')

/**
 * Uploads multipart files to `<folder>/YYYY/MM/<name>` of the vault bound to the upload key
 * (`Authorization: Bearer <key>`), for phone automations that can't hold the session cookie.
 * Never overwrites: the same content already at the path is skipped, so a re-run is harmless;
 * different content goes to `name (n).ext`.
 */
export default defineEventHandler(async (event) => {
  const key = getRequestHeader(event, 'authorization')?.match(/^Bearer (\S+)$/)?.[1]
  const auth = key ? await unsealUploadKey(key, useRuntimeConfig(event).session.password) : undefined
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Invalid upload key' })

  const length = Number(getRequestHeader(event, 'content-length'))
  if (!length) throw createError({ statusCode: 411, statusMessage: 'Content-Length required' })
  if (length > MAX_INGEST_BYTES) throw createError({ statusCode: 413, statusMessage: `Request larger than ${MAX_INGEST_BYTES} bytes` })

  const parts = (await readMultipartFormData(event))?.filter(part => part.filename) ?? []
  const parsed = ingestFilesSchema.safeParse(parts)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Send one or more files as multipart form data' })

  const contentsUrl = (path: string) => (owner: string) => `/repos/${owner}/${encodeURIComponent(auth.repo)}/contents/${encodePath(path)}`
  const findExistingSha = (path: string) => github<GhRepoContentsResponseData>(event, contentsUrl(path), { auth })
    .then(existing => Array.isArray(existing) ? '' : existing.sha, (error) => {
      if (error?.statusCode === 404) return undefined
      throw error
    })

  const now = new Date()
  const uploaded: string[] = []
  const skipped: string[] = []
  // ponytail: one file at a time; parallel PUTs on one branch make GitHub reject commits with 409
  for (const { filename, data } of parsed.data) {
    const target = getIngestPath(auth.folder, filename, now)
    const sha = gitBlobSha(data)
    let path = target
    let existing = await findExistingSha(path)
    for (let copy = 1; existing !== undefined && existing !== sha; copy++) {
      path = withCopyNumber(target, copy)
      existing = await findExistingSha(path)
    }
    if (existing === sha) {
      skipped.push(path)
      continue
    }
    await github(event, contentsUrl(path), {
      method: 'PUT',
      body: { content: data.toString('base64'), message: 'feat: upload file from phone' },
      auth,
    })
    uploaded.push(path)
  }
  return { uploaded, skipped }
})
