import type { OperationStatus } from '~/helpers'
import { $createFolder } from '~/resources/CDNFolders/api'

const createFilePath = (queryPath: string | undefined, fileName: string) => {
  if (!queryPath || queryPath === '') return fileName
  return queryPath.split('/').concat(fileName).join('/')
}

export const useCreateFolder = () => {
  const { queryPath } = useRouteQueryPath()

  const toast = useToast()
  const { t } = useI18n()

  const createFolder = async (name: string): Promise<OperationStatus> => {
    const { params: { repo } } = useRoute()
    if (!repo || Array.isArray(repo)) return 'error'

    const folderName = `${name}/.gitkeep`
    const path = createFilePath(queryPath.value, folderName)

    const toastId = `folder-${path}`
    toast.add({
      id: toastId,
      title: t('operationInProgress'),
      timeout: 0,
      icon: 'i-mdi-loading',
      ui: {
        icon: { base: 'animate-spin' },
      },
    })
    try {
      await $createFolder({ path, repo })
      toast.update(toastId, {
        title: t('successMessage'),
        color: 'green',
        timeout: 3000,
        icon: 'i-mdi-check',
        ui: {
          icon: { base: 'animate-none' },
        },
      })
      refreshNuxtData()
      return 'success'
    }
    catch (error) {
      let errorMessage = t('errorMessage')
      if (error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string') {
        errorMessage = error.statusMessage
      }
      toast.update(toastId, {
        title: errorMessage,
        color: 'red',
        timeout: 3000,
        icon: 'i-mdi-alert-outline',
        ui: {
          icon: { base: 'animate-none' },
        },
      })
      return 'error'
    }
  }
  return { createFolder }
}
