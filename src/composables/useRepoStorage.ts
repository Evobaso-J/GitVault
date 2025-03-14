import { useLocalStorage } from '@vueuse/core'
import type { CDNUserRepoName } from '~/resources/CDNUserRepos'

/**
 * Exposes a writable ref to save and share the active repository name
 * from the local storage.
 *
 * It also checks if the active repository still exists in the list of repositories
 * fetched from the server.
 * If it doesn't exist, it sets the active repository to `undefined`.
 */
export const useRepoStorage = () => {
  const activeRepository = ref<CDNUserRepoName>()
  useLocalStorage('default-repo', activeRepository)

  const { data } = useFetch('/gh-user-repos')

  const isAnyRepoPresent = computed<boolean>(() => !!data.value?.length)

  const repositoryNames = computed<CDNUserRepoName[]>(() => data.value?.map(repo => repo.name) || [])

  const activeRepositoryStillExists = computed(() => {
    if (!activeRepository.value) {
      return false
    }
    return repositoryNames.value.includes(activeRepository.value)
  })

  watch([activeRepository, activeRepositoryStillExists], ([newActiveRepositoryValue, exists]) => {
    if (!!newActiveRepositoryValue && !exists) {
      activeRepository.value = undefined
    }
  })
  watch([activeRepository, isAnyRepoPresent], ([newActiveRepositoryValue, isAnyRepoPresent]) => {
    if (!!newActiveRepositoryValue && !isAnyRepoPresent) {
      activeRepository.value = undefined
    }
  })

  return {
    activeRepository,
  }
}
