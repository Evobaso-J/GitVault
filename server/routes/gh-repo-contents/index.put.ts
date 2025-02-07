import { fileSchemaPut, type GhRepoContentsRequestParams, type GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler<{ body: GhRepoContentsRequestParams, query: Record<string, string> }, Promise<GhRepoContentsResponseData>>(async (event) => {
  const { secure, user } = await requireUserSession(event)
  const query = getQuery(event)
  const body = await readValidatedBody<GhRepoContentsRequestParams>(event, data => fileSchemaPut.parse(data))
  return await $fetch<GhRepoContentsResponseData>(`https://api.github.com/repos/${user.login}/${query.repo}/contents/${query.path}`, {
    method: 'PUT',
    body,
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
