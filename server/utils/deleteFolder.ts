import type { GhCreateTreeEntry, GhGitTreeEntry, GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'
import { github } from './github'

/**
 * Entries of a new tree, built on the current one, that drop every file under `folder`.
 * Git has no empty folders, so the folder goes with its last file. GitHub can't commit
 * an empty tree, so emptying the vault keeps a hidden root `.gitkeep`.
 */
export const buildFolderDeleteTree = (tree: GhGitTreeEntry[], folder: string): GhCreateTreeEntry[] => {
  const files = tree.filter(entry => entry.type !== 'tree' && entry.path)
  const inFolder = files.filter(entry => entry.path!.startsWith(`${folder}/`))
  if (!inFolder.length) throw createError({ statusCode: 404, statusMessage: `Folder ${folder} not found` })
  const entries: GhCreateTreeEntry[] = inFolder.map(entry => ({
    path: entry.path,
    mode: entry.mode as GhCreateTreeEntry['mode'],
    type: entry.type as GhCreateTreeEntry['type'],
    sha: null,
  }))
  if (inFolder.length < files.length) return entries
  return [...entries, { path: '.gitkeep', mode: '100644', type: 'blob', content: '' }]
}

/**
 * Deletes `folder` (raw path, not URL-encoded) and everything under it in one commit, via
 * the Git Data API. A tree too large for GitHub to return whole fails before any write;
 * a branch that moved meanwhile fails on the non-forced ref update.
 */
export const deleteVaultFolder = async (event: Parameters<typeof github>[0], repo: string, branch: string, folder: string) => {
  const head = await github<{ object: { sha: string } }>(event, owner => `/repos/${owner}/${repo}/git/ref/heads/${branch}`)
  // Any tree-ish works here: GitHub resolves the commit to its tree
  const tree = await github<GhRepoTreeResponseData>(event, owner => `/repos/${owner}/${repo}/git/trees/${head.object.sha}`, { query: { recursive: '1' } })
  if (tree.truncated) throw createError({ statusCode: 422, statusMessage: 'This vault is too large to delete a folder from GitVault' })
  const newTree = await github<{ sha: string }>(event, owner => `/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    body: { base_tree: tree.sha, tree: buildFolderDeleteTree(tree.tree, folder) },
  })
  const commit = await github<{ sha: string }>(event, owner => `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: { message: 'feat: delete folder', tree: newTree.sha, parents: [head.object.sha] },
  })
  return github(event, owner => `/repos/${owner}/${repo}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha, force: false } })
}
