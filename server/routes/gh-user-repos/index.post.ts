import { repoSchemaPost } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, data => repoSchemaPost.parse(data))
  return github(event, () => '/user/repos', { method: 'POST', body })
})
