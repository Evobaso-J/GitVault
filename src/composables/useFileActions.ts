import { ConfirmDeleteModal, RenameFileModal } from '#components'
import type { CDNFile } from '~/resources/CDNFiles'
import type { CDNFolder } from '~/resources/CDNFolders'
import { downloadFile, getPathToFile, getPathToFolder } from '~/resources/CDNFiles/utils'

// Shared by every useFileActions: one delete at a time across the app
let isDeleting = false

/**
 * Actions on a single file (or folder, for delete) of the active vault repo, shared by
 * the folder list, the preview panel and the file page.
 */
export const useFileActions = () => {
  const route = useRoute()
  const { origin } = useRequestURL()
  const toast = useToast()
  const { t } = useI18n()
  const { pickAndReplace, remove: removeFile, removeFolder: removeVaultFolder, rename: renameFile } = useVaultContents()
  const { queryPath } = useRouteQueryPath()
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
      if (route.name === 'vaults-repo-file-path') {
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

  const removeFolder = async (folder: CDNFolder) => {
    if (isDeleting) return
    isDeleting = true
    try {
      const confirmed = await overlay.create(ConfirmDeleteModal, { destroyOnClose: true }).open({ name: folder.name, folder: true })
      if (!confirmed) return
      // Inside the folder (or a subfolder): leave for its parent first, or the refresh would refetch a deleted folder
      if (queryPath.value === folder.to || queryPath.value?.startsWith(`${folder.to}/`)) {
        await navigateTo(getPathToFolder({ path: folder.to.split('/').slice(0, -1).join('/'), repo: route.params.repo }))
      }
      await removeVaultFolder(folder.to)
    }
    finally {
      isDeleting = false
    }
  }

  const rename = async (file: CDNFile) => {
    const name = await overlay.create(RenameFileModal, { destroyOnClose: true }).open({ name: file.name })
    if (!name || name === file.name) return
    const onFilePage = route.name === 'vaults-repo-file-path'
    await renameFile({ path: file.path, sha: file.sha }, name, async () => {
      // File page: open the new path instead of refreshing, which would refetch the old one
      if (onFilePage) {
        await navigateTo(getPathToFile({ path: createFilePath(file.path.split('/').slice(0, -1).join('/'), name), repo: route.params.repo }), { replace: true })
        return
      }
      // Folder view: start the refresh first, so the listing is already pending when the
      // query moves to the new name and the page keeps the preview open (see selectedFile)
      const refreshing = refreshNuxtData()
      if (route.query.file === file.name) await navigateTo({ query: { ...route.query, file: name } })
      await refreshing
    })
  }

  return { getFileUrl, download, copyLink, replace, remove, removeFolder, rename }
}
