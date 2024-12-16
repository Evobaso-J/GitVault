export const useSearch = (query: Ref<string | undefined>) => {
  const foundItems = ref<object[]>([])

  return { foundItems }
}
