import type { Endpoints } from '@octokit/types'
import type { GhRepoContentsResponseData, GhRepoContentsRenameParams } from '~~/server/resources/gitHubRepoContents'
import { github } from './github'

type GitRef = Endpoints['GET /repos/{owner}/{repo}/git/ref/{ref}']['response']['data']
type GitCommit = Endpoints['GET /repos/{owner}/{repo}/git/commits/{commit_sha}']['response']['data']
type GitTree = Endpoints['POST /repos/{owner}/{repo}/git/trees']['response']['data']
type GitNewCommit = Endpoints['POST /repos/{owner}/{repo}/git/commits']['response']['data']

type RenameTarget = {
  repo: string
  /** Path of the file, URL-encoded per segment (as `vaultRepoQuerySchema` returns it) */
  path: string
  branch: string
}

/**
 * Renames a file in its folder with one commit through the Git Data API: GitHub has no rename
 * endpoint, and PUT new + DELETE old would be two commits that re-send the content.
 * Refuses when the name is taken or the file changed since the user saw it (`sha`).
 * The ref update is a fast-forward only, so a commit landing meanwhile fails it instead of being lost.
 */
export const renameFile = async (event: Parameters<typeof github>[0], { repo, path, branch }: RenameTarget, { name, sha }: GhRepoContentsRenameParams) => {
  const slash = path.lastIndexOf('/') + 1
  const oldName = decodeURIComponent(path.slice(slash))
  if (name === oldName) return
  const folder = path.slice(0, Math.max(slash - 1, 0))
  const repoUrl = (owner: string) => `/repos/${owner}/${repo}`

  const ref = await github<GitRef>(event, owner => `${repoUrl(owner)}/git/ref/heads/${branch}`)
  const head = ref.object.sha
  // ponytail: the contents API lists up to 1,000 entries per folder; past that, a taken name slips to the tree call
  const siblings = await github<GhRepoContentsResponseData>(event, owner => `${repoUrl(owner)}/contents/${folder}`, { query: { ref: head } })
  const entries = Array.isArray(siblings) ? siblings : []
  if (entries.some(entry => entry.name === name)) {
    throw createError({ statusCode: 422, statusMessage: `A file named ${name} already exists in this folder` })
  }
  if (!entries.some(entry => entry.name === oldName && entry.type === 'file' && entry.sha === sha)) {
    throw createError({ statusCode: 409, statusMessage: `${oldName} changed or was removed: refresh and try again` })
  }

  const from = decodeURIComponent(path)
  const to = folder ? `${decodeURIComponent(folder)}/${name}` : name
  const commit = await github<GitCommit>(event, owner => `${repoUrl(owner)}/git/commits/${head}`)
  // Files written through the contents API are always plain blobs (100644)
  const tree = await github<GitTree>(event, owner => `${repoUrl(owner)}/git/trees`, {
    method: 'POST',
    body: {
      base_tree: commit.tree.sha,
      tree: [
        { path: to, mode: '100644', type: 'blob', sha },
        { path: from, mode: '100644', type: 'blob', sha: null },
      ],
    },
  })
  const renamed = await github<GitNewCommit>(event, owner => `${repoUrl(owner)}/git/commits`, {
    method: 'POST',
    body: { message: `feat: rename ${oldName} to ${name}`, tree: tree.sha, parents: [head] },
  })
  await github(event, owner => `${repoUrl(owner)}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: renamed.sha } })
}
