import type { GhCreateTreeEntry, GhGitTreeEntry } from '~~/server/resources/gitHubRepoTree'
import { commitTreeChanges } from './commitTreeChanges'

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

/** Deletes `folder` (raw path, not URL-encoded) and everything under it in one commit */
export const deleteVaultFolder = (event: Parameters<typeof commitTreeChanges>[0], repo: string, branch: string, folder: string) =>
  commitTreeChanges(event, repo, branch, tree => buildFolderDeleteTree(tree.tree, folder), `Delete folder ${folder}`)
