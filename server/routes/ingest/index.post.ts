import { ingestFilesSchema, type IngestResponse } from '~~/server/resources/uploadKey'

// Multipart boundaries and headers around one file under the cap
const MULTIPART_OVERHEAD_BYTES = 16 * 1024

/**
 * Phone automations post files here with `Authorization: Bearer <upload key>` instead of the
 * session cookie: optional text field `taken` (ISO date of the photo), one or more `file` parts.
 * The writing rules live in `ingestFiles`.
 */
export default defineEventHandler(async (event): Promise<IngestResponse> => {
  const key = getRequestHeader(event, 'authorization')?.match(/^Bearer (\S+)$/)?.[1]
  const auth = key ? await unsealUploadKey(key, useRuntimeConfig(event).session.password) : undefined
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Invalid upload key' })

  // Netlify drops bodies over 6 MB with a 502 before we see them: fail fast with a real reason
  const length = Number(getRequestHeader(event, 'content-length'))
  if (!length) throw createError({ statusCode: 411, statusMessage: 'Content-Length required' })
  if (length > MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES) throw createError({ statusCode: 413, statusMessage: `Send one file per request, each under ${MAX_UPLOAD_BYTES} bytes` })

  const parts = await readMultipartFormData(event) ?? []
  const files = ingestFilesSchema.safeParse(parts.filter(part => part.filename))
  if (!files.success) throw createError({ statusCode: 400, statusMessage: 'Send one or more files as multipart form data' })
  const taken = parts.find(part => part.name === 'taken' && !part.filename)?.data.toString()

  return ingestFiles(event, auth, files.data, taken)
})
