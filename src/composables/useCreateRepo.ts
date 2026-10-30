import type { OperationStatus } from '~/helpers'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

export const useCreateUserRepo = () => {
  const { runOperation } = useOperationToast()

  const createUserRepo = ({ name }: { name: CDNUserRepoName }): Promise<OperationStatus> =>
    runOperation(`repo-${name}`, () => $fetch('/gh-user-repos', {
      method: 'POST',
      body: { name, private: true },
    }))

  return { createUserRepo }
}
