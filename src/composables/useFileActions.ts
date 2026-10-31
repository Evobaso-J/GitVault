import { ConfirmDeleteModal } from '#components'
import type { CDNFile } from '~/resources/CDNFiles'
import { downloadFile, getPathToFile, getPathToFolder } from '~/resources/CDNFiles/utils'

// Shared by every useFileActions: one delete at a time across the app
let isDeleting = false

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
    // A double click would open two modals and send two deletes
    if (isDeleting) return
    isDeleting = true
    try {
      // Created on demand and destroyed on close: every row has its own useFileActions
      const confirmed = await overlay.create(ConfirmDeleteModal, { destroyOnClose: true }).open({ name: file.name })
      if (!confirmed) return
      // Leave the file page for its folder before deleting: the refresh after the delete
      // would refetch the deleted file on the page. A failed delete shows its toast there.
      if (route.name === 'repo-file-path') {
        await navigateTo(getPathToFolder({ path: file.path.split('/').slice(0, -1).join('/'), repo: route.params.repo }))
        await removeFile({ path: file.path, sha: file.sha })
        return
      }
      // The file is gone: close its preview
      if (await removeFile({ path: file.path, sha: file.sha }) === 'success' && route.query.file === file.name) {
        await navigateTo({ query: { ...route.query, file: undefined } })
      }
    }
    finally {
      isDeleting = false
    }
  }

  return { getFileUrl, download, copyLink, replace, remove }
}
