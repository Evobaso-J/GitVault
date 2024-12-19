import type { Endpoints } from '@octokit/types'

export type GhRepoTreeResponse = Endpoints['GET /repos/{owner}/{repo}/git/trees/{tree_sha}']['response']
export type GhRepoTreeResponseData = GhRepoTreeResponse['data']
