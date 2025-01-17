import type { Repository } from '~/composables/useRepository'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

type PutFilePayload = {
  path: string
  repo: Repository
  body: GhRepoContentsRequestParams
}

export const $putFile = ({ path, body, repo }: PutFilePayload) => {
  return $fetch('/api/gh-repo-contents', {
    method: 'PUT',
    query: {
      path,
      repo,
    },
    body,
  })
}
