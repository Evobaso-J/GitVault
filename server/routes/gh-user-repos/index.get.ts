import { GITVAULT_REPO_PREFIX, type GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<GhUserReposData> => {
  const { secure } = await requireUserSession(event)
  const result = await $fetch<GhUserReposData>(`https://api.github.com/user/repos`, {
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (result) {
    return result.filter(repo => repo.name.startsWith(GITVAULT_REPO_PREFIX))
  }
  return result
})
