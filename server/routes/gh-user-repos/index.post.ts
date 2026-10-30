import { repoSchemaPost } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, data => repoSchemaPost.parse(data))
  return createVaultRepo(event, body)
})
