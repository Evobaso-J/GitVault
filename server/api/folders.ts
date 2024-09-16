import type { Endpoints } from '@octokit/types'

export type GithubRepoContentsResponse = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']

export default defineEventHandler(async (event): Promise<GithubRepoContentsResponse> => {
  const query = getQuery(event)
  const { ghToken, ghRepoOwner, ghRepoName } = useRuntimeConfig()
  return await $fetch(`https://api.github.com/repos/${ghRepoOwner}/${ghRepoName}/contents/${query.path}`, {
    query,
    headers: {
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
})
