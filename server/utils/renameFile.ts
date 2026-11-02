import type { GhCreateTreeEntry, GhGitTreeEntry } from '~~/server/resources/gitHubRepoTree'
import type { GhRepoContentsRenameParams } from '~~/server/resources/gitHubRepoContents'
import { getLockedExtension } from '~/resources/CDNFiles/constants'
import { commitTreeChanges, operationError } from './commitTreeChanges'

const FILE_MODES = ['100644', '100755']

/**
 * Entries of a new tree that move the file at `from` to `to`, keeping its blob and mode.
 * Refuses anything but a regular file, a file changed or gone since the user saw `sha`,
 * and a `to` that already exists.
 */
export const buildRenameTree = (tree: GhGitTreeEntry[], from: string, to: string, sha: string): GhCreateTreeEntry[] => {
  const entry = tree.find(item => item.path === from)
  if (entry && (entry.type !== 'blob' || !FILE_MODES.includes(entry.mode ?? ''))) {
    throw operationError(400, 'notRenamable', `${from} is not a file GitVault can rename`)
  }
  if (entry?.sha !== sha) throw operationError(409, 'vaultChanged', `${from} changed or was removed: refresh and try again`)
  if (tree.some(item => item.path === to)) throw operationError(409, 'nameTaken', `${to} already exists`)
  const mode = entry.mode as GhCreateTreeEntry['mode']
  return [
    { path: to, mode, type: 'blob', sha },
    { path: from, mode, type: 'blob', sha: null },
  ]
}

/**
 * Renames the file at `path` (raw, not URL-encoded) in its folder, in one commit: GitHub has
 * no rename endpoint, and PUT new + DELETE old would be two commits that re-send the content.
 * The extension can't change (`getLockedExtension`), whatever the client sends.
 */
export const renameFile = async (event: Parameters<typeof commitTreeChanges>[0], { repo, path, branch }: { repo: string, path: string, branch: string }, { name, sha }: GhRepoContentsRenameParams) => {
  const slash = path.lastIndexOf('/') + 1
  const oldName = path.slice(slash)
  if (!oldName) throw operationError(400, 'notRenamable', 'Pick a file to rename')
  const extension = getLockedExtension(oldName)
  if (!name.endsWith(extension) || name === extension) {
    throw createError({ statusCode: 400, statusMessage: `The new name must end with ${extension}` })
  }
  if (name === oldName) return
  return commitTreeChanges(event, repo, branch, tree => buildRenameTree(tree.tree, path, path.slice(0, slash) + name, sha), `Rename ${oldName} to ${name}`)
}
