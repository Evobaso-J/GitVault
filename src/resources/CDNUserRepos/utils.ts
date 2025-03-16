import type { CDNUserRepoName } from '.'
import { GITVAULT_REPO_PREFIX } from '~/config'

export const isRepoNameValid = (repoName: string): repoName is CDNUserRepoName => {
  return repoName.startsWith(GITVAULT_REPO_PREFIX)
}
