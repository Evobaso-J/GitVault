import { GITVAULT_REPO_PREFIX } from '~/config'
import type { CDNUserRepo, CDNUserReposData, GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<CDNUserReposData> => {
  const repos = await github<GhUserReposData>(event, () => '/user/repos')
  return repos.filter((repo): repo is CDNUserRepo => repo.name.startsWith(GITVAULT_REPO_PREFIX))
})
