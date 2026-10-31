import { fileSchemaDelete } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event) => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const body = await readValidatedBody(event, data => fileSchemaDelete.parse(data))
  return github(event, owner => `/repos/${owner}/${repo}/contents/${path}`, { method: 'DELETE', body })
})
