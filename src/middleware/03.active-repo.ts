import type { RouteParamsGeneric } from '#vue-router'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

const getRouteParamRepository = (routeParams: RouteParamsGeneric[string] | undefined): string | undefined => {
  if (Array.isArray(routeParams)) {
    return routeParams[0]
  }
  return routeParams
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { activeRepository } = useRepoStorage()

  const routeRepoName = getRouteParamRepository(to.params.repo)

  if (!activeRepository.value && !routeRepoName) {
    return navigateTo('/')
  }

  if (!routeRepoName) {
    return navigateTo(`/${activeRepository.value}`)
  }

  if (isRepoNameValid(routeRepoName)) {
    activeRepository.value = routeRepoName
    return
    // If the repo does not exist, we let the user navigate to a non-existing page
    // and let the page handle the error.
  }

  // If the route param is not a valid repository name, we let the user navigate to a non-existing page
  // and let the page handle the error.
})
