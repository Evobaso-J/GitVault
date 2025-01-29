import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

export default defineEventHandler(async (event): Promise<GhRepoTreeResponseData> => {
  const { secure, user } = await requireUserSession(event)
  const query = getQuery(event)
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  return await $fetch(`https://api.github.com/repos/${user.login}/${query.repo}/git/trees/${ghDefaultBranch}`, {
    query,
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
