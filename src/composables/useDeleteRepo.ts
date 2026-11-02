import { ConfirmDeleteVaultModal } from '#components'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

export const useDeleteUserRepo = () => {
  const { runOperation } = useOperationToast()
  const overlay = useOverlay()
  const { repositoryNames } = useRepoStorage()

  const deleteUserRepo = async (name: CDNUserRepoName) => {
    // Created on demand and destroyed on close, like ConfirmDeleteModal in useFileActions
    const confirmed = await overlay.create(ConfirmDeleteVaultModal, { destroyOnClose: true }).open({ name })
    if (!confirmed) return
    // Optimistic: move to another vault before deleting, or the refresh after the delete would
    // refetch the deleted one. Another vault always exists: the last one can't be deleted.
    const next = repositoryNames.value.find(repo => repo !== name)
    await navigateTo(next ? `/vaults/${next}` : '/vaults')
    await runOperation(`delete-repo-${name}`, () => $fetch('/gh-user-repos', {
      method: 'DELETE',
      query: { repo: name },
    }))
  }

  return { deleteUserRepo }
}
