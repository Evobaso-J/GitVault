import type { OperationStatus } from '~/helpers'
import { $createFolder } from '~/resources/CDNFolders/api'

export const useCreateFolder = () => {
  const { queryPath } = useRouteQueryPath()
  const { runOperation } = useOperationToast()

  const createFolder = async (name: string): Promise<OperationStatus> => {
    const { params: { repo } } = useRoute()
    if (!repo || Array.isArray(repo)) return 'error'

    const path = createFilePath(queryPath.value, `${name}/.gitkeep`)
    return runOperation(`folder-${path}`, () => $createFolder({ path, repo }))
  }
  return { createFolder }
}
