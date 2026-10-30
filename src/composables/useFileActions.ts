import type { CDNFile } from '~/resources/CDNFiles'
import { downloadFile, getPathToFile } from '~/resources/CDNFiles/utils'

/**
 * Actions on a single file of the active vault repo, shared by the folder list,
 * the preview panel and the file page.
 */
export const useFileActions = () => {
  const route = useRoute()
  const { origin } = useRequestURL()
  const toast = useToast()
  const { t } = useI18n()
  const { pickAndReplace } = useVaultContents()

  const getFileUrl = (file: CDNFile) => getPathToFile({ path: file.path, repo: route.params.repo })

  const download = (file: CDNFile) => {
    if (file.download_url) downloadFile(file.download_url, file.name)
  }

  const copyLink = async (file: CDNFile) => {
    await navigator.clipboard.writeText(new URL(getFileUrl(file), origin).toString())
    toast.add({ title: t('copied'), icon: 'i-mdi-check', duration: 2000 })
  }

  const replace = (file: CDNFile) => pickAndReplace({ path: file.path, sha: file.sha })

  return { getFileUrl, download, copyLink, replace }
}
