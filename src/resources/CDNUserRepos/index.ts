import type { GITVAULT_REPO_PREFIX } from '~/config'

export type CDNUserRepoName = `${typeof GITVAULT_REPO_PREFIX}${string}`
