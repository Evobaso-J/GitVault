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

    try {
      await $createFolder(path)
      toast.add({
        title: t('successMessage'),
        color: 'green',
      })
      refreshNuxtData()
    }
    catch (error) {
      toast.add({
        title: t('errorMessage'),
        color: 'red',
      })
    }
  }
  return { createFolder }
}
