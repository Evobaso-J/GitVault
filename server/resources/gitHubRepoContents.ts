import type { Endpoints } from '@octokit/types'

export type GhRepoContentsResponse = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']
export type GhRepoContentsResponseData = GhRepoContentsResponse['data']
