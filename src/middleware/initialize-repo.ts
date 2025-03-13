import type { RouteParamsGeneric } from '#vue-router'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

const getRouteParamRepository = (routeParam: RouteParamsGeneric[string] | undefined): string | undefined => {
  let routeRepoName: string | undefined
  if (Array.isArray(routeParam)) {
    routeRepoName = routeParam[0]
  }
  else {
    routeRepoName = routeParam
  }
  return routeRepoName
}

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const routeRepoName = getRouteParamRepository(to.params.repo)
  const { activeRepository } = useRepoStorage()
  if (routeRepoName && isRepoNameValid(routeRepoName)) {
    activeRepository.value = routeRepoName
    return
  }
  if (loggedIn.value && !routeRepoName) {
    return navigateTo(`/${activeRepository.value}`)
  }
})
