import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event): Promise<GhRepoContentsResponseData> => {
  const { secure, user } = await requireUserSession(event)
  const query = getQuery(event)
  return await $fetch(`https://api.github.com/repos/${user.login}/${query.repo}/contents/${query.path}`, {
    query,
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
