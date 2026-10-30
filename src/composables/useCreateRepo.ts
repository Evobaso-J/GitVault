import type { OperationStatus } from '~/helpers'
import { $createUserRepo, type CreateUserRepoPayload } from '~/resources/CDNUserRepos/api'

export const useCreateUserRepo = () => {
  const { runOperation } = useOperationToast()

  const createUserRepo = ({ name }: CreateUserRepoPayload): Promise<OperationStatus> =>
    runOperation(`repo-${name}`, () => $createUserRepo({ name }))

  return { createUserRepo }
}
