import type { Endpoints } from '@octokit/types'

export type GhRepoTreeResponse = Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']['response']
export type GhRepoTreeResponseData = GhRepoTreeResponse['data']
export type GhGitTreeEntry = GhRepoTreeResponseData['tree'][number]
export type GhCreateTreeEntry = Endpoints['POST /repos/{owner}/{repo}/git/trees']['parameters']['tree'][number]
