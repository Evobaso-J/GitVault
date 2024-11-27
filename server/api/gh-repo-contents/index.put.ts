import type { GhRepoContentsRequestParams, GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

// : Promise<GhRepoContentsResponseData>
// <GhRepoContentsRequestParams, GhRepoContentsResponseData>
export default defineEventHandler<{ body: GhRepoContentsRequestParams, query: Record<string, string> }, Promise<GhRepoContentsResponseData>>(async (event) => {
  const query = getQuery(event)
  // TODO: add validation with readValidatedBody and zod
  const body = readBody<GhRepoContentsRequestParams>(event)
  const { ghToken, ghRepoOwner, ghRepoName } = useRuntimeConfig(event)
  return await $fetch<GhRepoContentsResponseData>(`https://api.github.com/repos/${ghRepoOwner}/${ghRepoName}/contents/${query.path}`, {
    method: 'PUT',
    body,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
