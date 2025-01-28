import type { Brand } from '~/helpers'

export type Repository = Brand<string | undefined, 'repository'>

/**
 * Fetches the user's repositories from the GitHub API
 */
export const useRepository = () => {
  const { data, ...rest } = useFetch('/api/gh-user-repos')

  const config = useRuntimeConfig()

  const repositoryNames = computed<Repository[]>(() => (
    data.value
      ?.filter(repo => repo.owner.login === config.public.ghRepoOwner)
      .map(repo => repo.name)
      ?? []) as Repository[])

  return {
    repositoryNames,
    ...rest,
  }
}
