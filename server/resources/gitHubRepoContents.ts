import { z } from 'zod'
import type { Endpoints } from '@octokit/types'

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
