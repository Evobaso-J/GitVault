import { repoSchemaPost, type GhUserReposRequest } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  const body = await readValidatedBody<GhUserReposRequest>(event, data => repoSchemaPost.parse(data))
  return await $fetch(`https://api.github.com/user/repos`, {
    method: 'POST',
    body,
    headers: {
      'Authorization': `Bearer ${secure?.tokens.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
