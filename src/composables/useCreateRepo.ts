import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

/** Creates a vault and opens it: the URL uses the name GitHub returns, which may differ from the typed one. */
export const useCreateUserRepo = () => {
  const { runOperation } = useOperationToast()

  const createUserRepo = async ({ name }: { name: CDNUserRepoName }) => {
    let createdName: CDNUserRepoName | undefined
    await runOperation(`repo-${name}`, async () => {
      ({ name: createdName } = await $fetch('/gh-user-repos', {
        method: 'POST',
        body: { name, private: true },
      }))
    })
    if (createdName) await navigateTo(`/vaults/${createdName}`)
  }

  return { createUserRepo }
}
