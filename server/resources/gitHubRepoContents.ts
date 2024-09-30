import type { Endpoints } from '@octokit/types'

export type ghRepoContentsResponse = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']
export type ghContentsResponseData = ghRepoContentsResponse['data']
