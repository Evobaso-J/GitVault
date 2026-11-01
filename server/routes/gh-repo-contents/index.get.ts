import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event): Promise<GhRepoContentsResponseData> => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  try {
    return await github(event, owner => `/repos/${owner}/${repo}/contents/${path}`)
  }
  catch (error) {
    if (isEmptyRepoError(error)) return []
    throw error
  }
})
