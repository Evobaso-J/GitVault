import type { GhRepoTreeResponseData } from '~~/server/resources/gitHubRepoTree'

export const useSearchFiles = (query: Ref<string | undefined>) => {
  const { data } = useFetch('/api/gh-repo-tree', {
    query: {
      recursive: 5,
    },
  })
  const foundFiles = computed<GhRepoTreeResponseData['tree']>(() => {
    return data.value?.tree
      .filter(item => (!query.value || item.path?.toLocaleLowerCase().includes(query.value))) ?? []
  })
  return { foundFiles }
}
