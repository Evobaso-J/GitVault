import type { H3Event } from 'h3'
import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'
import { github } from './github'

/** Every entry of the vault's default branch; empty for a repo with no commit yet (GitHub answers 409) */
export const getRepoTree = async (event: H3Event, repo: string, auth?: { login: string, token: string }): Promise<GhRepoTreeResponseData['tree']> => {
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  try {
    // Any value of `recursive` makes GitHub return the whole tree
    const { tree } = await github<GhRepoTreeResponseData>(event, owner => `/repos/${owner}/${encodeURIComponent(repo)}/git/trees/${ghDefaultBranch}`, { query: { recursive: '1' }, auth })
    return tree
  }
  catch (error) {
    if (error instanceof Error && 'statusCode' in error && error.statusCode === 409) return []
    throw error
  }
}
