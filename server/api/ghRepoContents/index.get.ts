import type { ghRepoContentsResponse } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event): Promise<ghRepoContentsResponse> => {
  const query = getQuery(event)
  const { ghToken, ghRepoOwner, ghRepoName } = useRuntimeConfig(event)
  return await $fetch(`https://api.github.com/repos/${ghRepoOwner}/${ghRepoName}/contents/${query.path}`, {
    query,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
