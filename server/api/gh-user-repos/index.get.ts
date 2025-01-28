import { GITVAULT_REPO_PREFIX, type GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<GhUserReposData> => {
  const { ghToken } = useRuntimeConfig(event)
  const result = await $fetch<GhUserReposData>(`https://api.github.com/user/repos`, {
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (result) {
    return result.filter(repo => repo.name.startsWith(GITVAULT_REPO_PREFIX))
  }
  return result
})
