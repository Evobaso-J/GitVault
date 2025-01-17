import { z } from 'zod'
import type { GhRepoContentsRequestParams, GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

const gitUserSchema: z.ZodType<GhRepoContentsRequestParams['author']> = z.object({
  name: z.string(),
  email: z.string(),
  date: z.string().optional(),
})

const fileSchemaPut: z.ZodType<GhRepoContentsRequestParams> = z.object({
  content: z.string(),
  message: z.string(),
  sha: z.string().optional(),
  author: gitUserSchema.optional(),
  branch: z.string().optional(),
  committer: gitUserSchema.optional(),
})

export default defineEventHandler<{ body: GhRepoContentsRequestParams, query: Record<string, string> }, Promise<GhRepoContentsResponseData>>(async (event) => {
  const query = getQuery(event)
  const body = await readValidatedBody<GhRepoContentsRequestParams>(event, data => fileSchemaPut.parse(data))
  const { ghToken, public: { ghRepoOwner } } = useRuntimeConfig(event)
  return await $fetch<GhRepoContentsResponseData>(`https://api.github.com/repos/${ghRepoOwner}/${query.repo}/contents/${query.path}`, {
    method: 'PUT',
    body,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
