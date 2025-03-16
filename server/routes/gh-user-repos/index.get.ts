import { GITVAULT_REPO_PREFIX } from '~/config'
import type { CDNUserRepo, CDNUserReposData, GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<CDNUserReposData> => {
  const { secure } = await requireUserSession(event)
  const result = await $fetch<GhUserReposData>(`https://api.github.com/user/repos`, {
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (result) {
    return result.filter((repo): repo is CDNUserRepo => repo.name.startsWith(GITVAULT_REPO_PREFIX))
  }
  return result
})
