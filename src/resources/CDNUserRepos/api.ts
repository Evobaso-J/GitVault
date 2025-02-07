import type { GITVAULT_REPO_PREFIX } from '~/config'

export type CreateUserRepoPayload = {
  name: `${typeof GITVAULT_REPO_PREFIX}${string}`
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
