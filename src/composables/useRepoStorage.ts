import { useLocalStorage } from '@vueuse/core'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

/**
 * The user's vault list, plus the last vault opened in this browser (localStorage).
 * The last opened vault may no longer exist: check it against `repositoryNames` before using it.
 */
export const useRepoStorage = () => {
  // Key kept from when this was the "default" vault, so existing users keep their value
  const lastOpenedRepository = useLocalStorage<CDNUserRepoName | undefined>('default-repo', undefined)

  const { data, status: fetchStatus } = useFetch('/gh-user-repos')

  const repositoryNames = computed<CDNUserRepoName[]>(() => data.value?.map(repo => repo.name) || [])

  // GitHub reports `size` in KB and refreshes it with a delay (up to hours after a push)
  const repositorySizes = computed(() => new Map(data.value?.map(repo => [repo.name, repo.size * 1024])))

  return {
    lastOpenedRepository,
    repositoryNames,
    repositorySizes,
    fetchStatus,
  }
}
