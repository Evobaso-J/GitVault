import { isVaultRepo } from '~~/server/resources/gitHubUserRepos'
import type { CDNUserReposData, GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<CDNUserReposData> => {
  const repos = await github<GhUserReposData>(event, () => '/user/repos')
  return repos.filter(isVaultRepo)
})
