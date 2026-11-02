import { GITVAULT_TOPIC } from '~/config'
import { isVaultRepo } from '~~/server/resources/gitHubUserRepos'
import type { CDNUserReposData, GhCreatedUserRepo, GhRepo, GhUserReposData, GhUserReposRequest } from '~~/server/resources/gitHubUserRepos'
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

const PER_PAGE = 100

/**
 * Every vault the user owns. GitHub pages /user/repos (30 per page by default), so a single
 * call silently drops repos; vaults are always created on the user's account, hence `owner`.
 */
export const listVaultRepos = async (event: Parameters<typeof github>[0]): Promise<CDNUserReposData> => {
  const repos: GhUserReposData = []
  for (let page = 1; ; page++) {
    const batch = await github<GhUserReposData>(event, () => '/user/repos', {
      query: { affiliation: 'owner', per_page: String(PER_PAGE), page: String(page) },
    })
    repos.push(...batch)
    if (batch.length < PER_PAGE) return repos.filter(isVaultRepo)
  }
}

/**
 * Deletes a vault. The token can delete any repo of the user, so the repo is read first and
 * refused unless it is a vault the user owns (same topic check as the list).
 * The DELETE uses the name GitHub returned: a renamed repo answers on its old name too.
 */
export const deleteVaultRepo = async (event: Parameters<typeof github>[0], name: string): Promise<void> => {
  let owner = ''
  const repo = await github<GhRepo>(event, (login) => {
    owner = login
    return `/repos/${login}/${encodeURIComponent(name)}`
  })
  if (repo.owner.login !== owner || !isVaultRepo(repo)) {
    throw createError({ statusCode: 404, statusMessage: `${name} is not a vault` })
  }
  await github(event, login => `/repos/${login}/${encodeURIComponent(repo.name)}`, { method: 'DELETE' })
}
