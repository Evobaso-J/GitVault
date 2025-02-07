import type { Endpoints } from '@octokit/types'

import { z } from 'zod'
import { GITVAULT_REPO_PREFIX } from '~/config'

type GhUserRepos = Endpoints['GET /user/repos']['response']

export type GhUserReposRequest = Endpoints['POST /user/repos']['parameters']
export type GhUserReposData = GhUserRepos['data']

export const repoSchemaPost: z.ZodType<GhUserReposRequest> = z.object({
  name: z.string().startsWith(GITVAULT_REPO_PREFIX),
  private: z.literal(true),
})
