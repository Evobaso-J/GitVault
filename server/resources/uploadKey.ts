import { z } from 'zod'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'
import { isPathSegment } from '~~/server/utils/github'

export const uploadKeySchemaPost = z.object({
  repo: z.string().refine(isRepoNameValid),
  platform: z.enum(['ios', 'android']),
})

export type UploadKeyRequest = z.infer<typeof uploadKeySchemaPost>
export type UploadKeyResponse = { key: string, kid: string }

/** Content of `UPLOAD_KEYS_DIR/<kid>.json`; the key is valid while the file exists */
export type UploadKeyRecord = { platform: UploadKeyRequest['platform'], createdAt: string }

/** File parts of an ingest request; the name is cut to its last segment so it can't leave the folder */
export const ingestFilesSchema = z.array(z.object({
  filename: z.string().transform(name => name.split(/[/\\]/).pop() ?? '').refine(isPathSegment),
  data: z.instanceof(Buffer),
})).min(1)

export type IngestFile = z.output<typeof ingestFilesSchema>[number]
export type IngestResponse = { uploaded: string[], skipped: string[], tooLarge: string[] }
