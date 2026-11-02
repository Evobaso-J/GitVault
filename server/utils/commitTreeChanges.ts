import type { GhCreateTreeEntry, GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'
import type { OperationErrorCode } from '~/resources/CDNFiles/constants'
import { github } from './github'

/** An error the client shows translated, by its `data.code` */
export const operationError = (statusCode: number, code: OperationErrorCode, statusMessage: string) =>
  createError({ statusCode, statusMessage, data: { code } })

/**
 * Writes one commit on `branch` through the Git Data API: ref → recursive tree → tree on
 * `base_tree` with the entries `build` returns → commit → non-forced ref update.
 * `build` gets the tree of the current head and throws to refuse. When the branch moved
 * between read and write (GitHub 422: not a fast-forward), it all runs once more on the new
 * head; a second miss throws `vaultChanged`. A truncated tree fails before any write.
 */
export const commitTreeChanges = async (
  event: Parameters<typeof github>[0],
  repo: string,
  branch: string,
  build: (tree: GhRepoTreeResponseData) => GhCreateTreeEntry[],
  message: string,
) => {
  const repoUrl = (owner: string) => `/repos/${owner}/${repo}`
  for (let attempt = 0; ; attempt++) {
    const ref = await github<{ object: { sha: string } }>(event, owner => `${repoUrl(owner)}/git/ref/heads/${branch}`)
    const head = ref.object.sha
    // Any tree-ish works here: GitHub resolves the commit to its tree
    const tree = await github<GhRepoTreeResponseData>(event, owner => `${repoUrl(owner)}/git/trees/${head}`, { query: { recursive: '1' } })
    if (tree.truncated) throw createError({ statusCode: 422, statusMessage: 'This vault is too large to change from GitVault' })
    const newTree = await github<{ sha: string }>(event, owner => `${repoUrl(owner)}/git/trees`, {
      method: 'POST',
      body: { base_tree: tree.sha, tree: build(tree) },
    })
    const commit = await github<{ sha: string }>(event, owner => `${repoUrl(owner)}/git/commits`, {
      method: 'POST',
      body: { message, tree: newTree.sha, parents: [head] },
    })
    try {
      return await github(event, owner => `${repoUrl(owner)}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha, force: false } })
    }
    catch (error) {
      // Other 422s (e.g. branch protection) won't pass on a retry
      const notFastForward = error instanceof Error && 'statusCode' in error && error.statusCode === 422
        && 'statusMessage' in error && typeof error.statusMessage === 'string' && /fast.forward/i.test(error.statusMessage)
      if (!notFastForward) throw error
      if (attempt) throw operationError(409, 'vaultChanged', 'The vault changed meanwhile: refresh and try again')
    }
  }
}
