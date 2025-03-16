import type { CDNUserRepoName } from '.'

export type CreateUserRepoPayload = {
  name: CDNUserRepoName
}

export const $createUserRepo = ({ name }: CreateUserRepoPayload) => {
  return $fetch('/gh-user-repos', {
    method: 'POST',
    body: {
      name,
      private: true,
    },
  })
}
