import { GITVAULT_TOPIC } from '~/config'
import type { GhCreatedUserRepo, GhUserReposRequest } from '~~/server/resources/gitHubUserRepos'
import { github } from './github'

/**
 * Creates the repo, then tags it with the `gitvault` topic (POST /user/repos takes no topics).
 * If tagging fails the repo still exists, so the error names it instead of reporting a plain failure.
 */
export const createVaultRepo = async (event: Parameters<typeof github>[0], body: GhUserReposRequest): Promise<GhCreatedUserRepo> => {
  const repo = await github<GhCreatedUserRepo>(event, () => '/user/repos', { method: 'POST', body })
  try {
    // PUT replaces every topic; a repo created a moment ago has none
    await github(event, owner => `/repos/${owner}/${encodeURIComponent(repo.name)}/topics`, {
      method: 'PUT',
      body: { names: [GITVAULT_TOPIC] },
    })
  }
  catch (error) {
    const statusCode = error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500
    const reason = error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string' ? error.statusMessage : String(error)
    throw createError({
      statusCode,
      statusMessage: `Repository ${repo.name} was created but could not be tagged as a vault: ${reason}`,
    })
  }
  return repo
}
