import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

export default defineEventHandler(async (event): Promise<GhRepoTreeResponseData> => {
  const { repo } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  // Any value of `recursive` makes GitHub return the whole tree
  return github(event, owner => `/repos/${owner}/${repo}/git/trees/${ghDefaultBranch}`, { query: { recursive: '1' } })
})
