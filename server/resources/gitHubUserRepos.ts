import type { Endpoints } from '@octokit/types'

import { z } from 'zod'

type GhUserRepos = Endpoints['GET /user/repos']['response']

export type GhUserReposRequest = Endpoints['POST /user/repos']['parameters']
export type GhUserReposData = GhUserRepos['data']

export const GITVAULT_REPO_PREFIX = 'gitvault-'

export const repoSchemaPost: z.ZodType<GhUserReposRequest> = z.object({
  name: z.string(),
  private: z.literal(true),
})
