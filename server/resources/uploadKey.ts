import { z } from 'zod'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'
import { isPathSegment } from '~~/server/utils/github'

export const uploadKeySchemaPost = z.object({
  repo: z.string().refine(isRepoNameValid),
  /** Base folder of the uploads, '' for the repo root */
  folder: z.string().max(200)
    .transform(folder => folder.trim().replace(/^\/+|\/+$/g, ''))
    .refine(folder => folder === '' || folder.split('/').every(isPathSegment)),
})

export type UploadKeyRequest = z.input<typeof uploadKeySchemaPost>
export type UploadKeyResponse = { key: string }

/** Per request: a phone shortcut sends a handful of photos; bigger bodies don't fit a serverless function anyway */
export const MAX_INGEST_BYTES = 20 * 1024 * 1024

/** File parts of an ingest request; the name is cut to its last segment so it can't leave the folder */
export const ingestFilesSchema = z.array(z.object({
  filename: z.string().transform(name => name.split(/[/\\]/).pop() ?? '').refine(isPathSegment),
  data: z.instanceof(Buffer),
})).min(1)
