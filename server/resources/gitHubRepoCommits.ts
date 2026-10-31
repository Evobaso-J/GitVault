import { z } from 'zod'
import type { Endpoints } from '@octokit/types'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

export type GhRepoCommitsResponseData = Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data']

/** `path` is a GitHub query filter, not a URL segment: it travels raw */
export const repoCommitsQuerySchema = z.object({
  repo: z.string().refine(isRepoNameValid),
  path: z.string().optional(),
  since: z.string().datetime().optional(),
})
