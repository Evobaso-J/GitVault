import { $createFolder } from '~/resources/CDNFolders/api'

const createFilePath = (queryPath: string | undefined, fileName: string) => {
  if (!queryPath || queryPath === '') return fileName
  return queryPath.split('/').concat(fileName).join('/')
}

export const useCreateFolder = () => {
  const { queryPath } = useRouteQueryPath()

  const toast = useToast()
  const { t } = useI18n()

  const createFolder = async () => {
    const folderName = 'Wollan/.gitkeep'
    const path = createFilePath(queryPath.value, folderName)

    const toastId = `folder-${path}`
    toast.add({
      id: toastId,
      title: t('operationInProgress'),
      timeout: 0,
      icon: 'i-mdi-loading animate-spin',
    })
    try {
      await $createFolder(path)
      toast.update(toastId, {
        title: t('successMessage'),
        color: 'green',
        timeout: 3000,
        icon: 'i-mdi-check',
      })
      refreshNuxtData()
    }
    catch (error) {
      toast.update(toastId, {
        title: t('errorMessage'),
        color: 'red',
        timeout: 3000,
        icon: 'i-mdi-alert',
      })
    }
  }
  return { createFolder }
}
