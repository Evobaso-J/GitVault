import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

type PutFilePayload = {
  path: string
  body: GhRepoContentsRequestParams
}

export const $putFile = ({ path, body }: PutFilePayload) => {
  return $fetch('/api/gh-repo-contents', {
    method: 'PUT',
    query: {
      path,
    },
    body,
  })
}
