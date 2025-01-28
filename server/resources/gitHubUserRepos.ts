import type { Endpoints } from '@octokit/types'

type GhUserRepos = Endpoints['GET /user/repos']['response']
export type GhUserReposData = GhUserRepos['data']

export const GITVAULT_REPO_PREFIX = 'gitvault'
