import { fileSchemaPut, type GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event): Promise<GhRepoContentsResponseData> => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const body = await readValidatedBody(event, data => fileSchemaPut.parse(data))
  return github(event, owner => `/repos/${owner}/${repo}/contents/${path}`, { method: 'PUT', body })
})
