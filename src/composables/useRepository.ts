import type { Brand } from '~/helpers'

export type Repository = Brand<string | undefined, 'repository'>

const activeRepository = ref<Repository>()

/**
 * Fetches the user's repositories from the GitHub API
 * and exposes a writable ref to set the active repository.
 */
export const useRepository = () => {
  const { data, ...rest } = useFetch('/api/gh-user-repos')

  const config = useRuntimeConfig()

  const repositoryNames = computed<Repository[]>(() => (
    data.value
      ?.filter(repo => repo.owner.login === config.public.ghRepoOwner)
      .map(repo => repo.name)
      ?? []) as Repository[])

  watch(repositoryNames, (newRepositoryNames) => {
    if (newRepositoryNames.length && !activeRepository.value) {
      activeRepository.value = newRepositoryNames[0]
    }
  })

  return {
    repositoryNames,
    activeRepository,
    ...rest,
  }
}
