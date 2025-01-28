import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

export default defineEventHandler(async (event): Promise<GhRepoTreeResponseData> => {
  const query = getQuery(event)
  const { ghToken, public: { ghRepoOwner, ghDefaultBranch } } = useRuntimeConfig(event)
  return await $fetch(`https://api.github.com/repos/${ghRepoOwner}/${query.repo}/git/trees/${ghDefaultBranch}`, {
    query,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
