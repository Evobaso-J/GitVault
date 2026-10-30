import type { Endpoints } from '@octokit/types'

import { z } from 'zod'
import { GITVAULT_REPO_PREFIX, GITVAULT_TOPIC } from '~/config'

type GhUserRepos = Endpoints['GET /user/repos']['response']

export type GhUserReposRequest = Endpoints['POST /user/repos']['parameters']
export type GhUserReposData = GhUserRepos['data']
export type GhUserRepo = GhUserReposData extends Array<infer T> ? T : never
export type GhCreatedUserRepo = Endpoints['POST /user/repos']['response']['data']

export type CDNUserRepo = GhUserRepo
export type CDNUserReposData = CDNUserRepo[]

/** A repo is a vault if it has the `gitvault` topic or, for vaults created before the topic, the `gitvault-` name prefix. */
export const isVaultRepo = (repo: Pick<GhUserRepo, 'name' | 'topics'>): boolean =>
  !!repo.topics?.includes(GITVAULT_TOPIC) || repo.name.startsWith(GITVAULT_REPO_PREFIX)

// The name only travels in the JSON body: GitHub normalizes it and returns the final one.
export const repoSchemaPost: z.ZodType<GhUserReposRequest> = z.object({
  name: z.string().min(1),
  private: z.literal(true),
})
