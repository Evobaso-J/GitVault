import { repoCommitsQuerySchema, type GhRepoCommitsResponseData } from '~~/server/resources/gitHubRepoCommits'

/** Newest 100 commits of the vault, optionally those touching `path` since an ISO date */
export default defineEventHandler(async (event): Promise<GhRepoCommitsResponseData> => {
  const { repo, path, since } = await getValidatedQuery(event, query => repoCommitsQuerySchema.parse(query))
  return github(event, owner => `/repos/${owner}/${repo}/commits`, { query: { ...(path && { path }), ...(since && { since }), per_page: '100' } })
})
