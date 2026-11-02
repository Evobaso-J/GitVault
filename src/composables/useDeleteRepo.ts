import { ConfirmDeleteVaultModal } from '#components'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

export const useDeleteUserRepo = () => {
  const { runOperation } = useOperationToast()
  const overlay = useOverlay()
  const { activeRepository, refresh } = useRepoStorage()

  const deleteUserRepo = async (name: CDNUserRepoName) => {
    // Created on demand and destroyed on close, like ConfirmDeleteModal in useFileActions
    const confirmed = await overlay.create(ConfirmDeleteVaultModal, { destroyOnClose: true }).open({ name })
    if (!confirmed) return
    const result = await runOperation(`delete-repo-${name}`, () => $fetch('/gh-user-repos', {
      method: 'DELETE',
      query: { repo: name },
    }))
    if (result !== 'success') return
    // The vault list is shared: '/' would read the stale one and send the user back here
    await refresh()
    if (activeRepository.value === name) activeRepository.value = undefined
    await navigateTo('/')
  }

  return { deleteUserRepo }
}
