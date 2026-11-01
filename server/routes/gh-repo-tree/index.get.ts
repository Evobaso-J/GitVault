import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

export default defineEventHandler(async (event): Promise<GhRepoTreeResponseData> => {
  const { repo } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  try {
    // Any value of `recursive` makes GitHub return the whole tree
    return await github(event, owner => `/repos/${owner}/${repo}/git/trees/${ghDefaultBranch}`, { query: { recursive: '1' } })
  }
  catch (error) {
    if (isEmptyRepoError(error)) return { sha: '', url: '', tree: [], truncated: false }
    throw error
  }
})
