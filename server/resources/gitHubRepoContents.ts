import type { Endpoints } from '@octokit/types'

export type GhRepoContentsResponse = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']
export type GhRepoContentsResponseData = GhRepoContentsResponse['data']

export type GhRepoContentsRequestParams = Omit<Endpoints['PUT /repos/{owner}/{repo}/contents/{path}']['parameters'], 'owner' | 'repo' | 'path'>
