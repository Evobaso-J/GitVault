import { useLocalStorage } from '@vueuse/core'
import { DEFAULT_REPO_NAME } from '~/config'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

/**
 * Exposes a writable ref to save and share the active repository name
 * from the local storage.
 */
export const useRepoStorage = () => {
  const activeRepository = ref<CDNUserRepoName>(DEFAULT_REPO_NAME)
  useLocalStorage('default-repo', activeRepository)

  return {
    activeRepository,
  }
}
