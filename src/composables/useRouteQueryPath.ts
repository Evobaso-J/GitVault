export const useRouteQueryPath = () => {
  const route = useRoute()

  const queryPath = computed<string | undefined>(() => {
    if (Array.isArray(route.params.path)) return route.params.path.join('/')
    return route.params.path
  })

  return { queryPath }
}
