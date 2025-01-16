import type { GhUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event): Promise<GhUserReposData> => {
  const { ghToken } = useRuntimeConfig(event)
  return await $fetch(`https://api.github.com/user/repos`, {
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
