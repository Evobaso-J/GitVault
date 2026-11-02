import { z } from 'zod'
import type { Endpoints } from '@octokit/types'
import { isFileNameValid } from '~/resources/CDNFiles/constants'

export type GhRepoContentsResponse = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']
export type GhRepoContentsResponseData = GhRepoContentsResponse['data']

export type GhRepoContentsRequestParams = Omit<Endpoints['PUT /repos/{owner}/{repo}/contents/{path}']['parameters'], 'owner' | 'repo' | 'path'>

const gitUserSchema: z.ZodType<GhRepoContentsRequestParams['author']> = z.object({
  name: z.string(),
  email: z.string(),
  date: z.string().optional(),
})

export const fileSchemaPut: z.ZodType<GhRepoContentsRequestParams> = z.object({
  content: z.string(),
  message: z.string(),
  sha: z.string().optional(),
  author: gitUserSchema.optional(),
  branch: z.string().optional(),
  committer: gitUserSchema.optional(),
})

export type GhRepoContentsDeleteParams = Pick<Endpoints['DELETE /repos/{owner}/{repo}/contents/{path}']['parameters'], 'message' | 'sha'>

export const fileSchemaDelete: z.ZodType<GhRepoContentsDeleteParams> = z.object({
  message: z.string(),
  sha: z.string(),
})

/** New name, in the same folder; `sha` is the blob the user saw, so a file changed since isn't clobbered */
export const fileSchemaRename = z.object({
  name: z.string().trim().refine(isFileNameValid),
  sha: z.string(),
})
export type GhRepoContentsRenameParams = z.infer<typeof fileSchemaRename>
