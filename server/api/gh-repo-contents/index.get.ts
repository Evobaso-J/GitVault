import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event): Promise<GhRepoContentsResponseData> => {
  const query = getQuery(event)
  const { ghToken, public: { ghRepoOwner } } = useRuntimeConfig(event)
  return await $fetch(`https://api.github.com/repos/${ghRepoOwner}/${query.repo}/contents/${query.path}`, {
    query,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
