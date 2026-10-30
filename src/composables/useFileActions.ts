import { ConfirmDeleteModal } from '#components'
import type { CDNFile } from '~/resources/CDNFiles'
import { downloadFile, getPathToFile, getPathToFolder } from '~/resources/CDNFiles/utils'

/**
 * Actions on a single file of the active vault repo, shared by the folder list,
 * the preview panel and the file page.
 */
export const useFileActions = () => {
  const route = useRoute()
  const { origin } = useRequestURL()
  const toast = useToast()
  const { t } = useI18n()
  const { pickAndReplace, remove: removeFile } = useVaultContents()
  const overlay = useOverlay()

  const getFileUrl = (file: CDNFile) => getPathToFile({ path: file.path, repo: route.params.repo })

  const download = (file: CDNFile) => {
    if (file.download_url) downloadFile(file.download_url, file.name)
  }

  const copyLink = async (file: CDNFile) => {
    await navigator.clipboard.writeText(new URL(getFileUrl(file), origin).toString())
    toast.add({ title: t('copied'), icon: 'i-mdi-check', duration: 2000 })
  }

  const replace = (file: CDNFile) => pickAndReplace({ path: file.path, sha: file.sha })

  const remove = async (file: CDNFile) => {
    // Created on demand and destroyed on close: every row has its own useFileActions
    const confirmed = await overlay.create(ConfirmDeleteModal, { destroyOnClose: true }).open({ name: file.name })
    if (!confirmed) return
    // On the file page every action targets the page's own file
    const isOpen = route.query.file === file.name || route.name === 'repo-file-path'
    if (await removeFile({ path: file.path, sha: file.sha }) === 'success' && isOpen) {
      // The file is gone: leave its page or preview for its folder
      await navigateTo(getPathToFolder({ path: file.path.split('/').slice(0, -1).join('/'), repo: route.params.repo }))
    }
  }

  return { getFileUrl, download, copyLink, replace, remove }
}
