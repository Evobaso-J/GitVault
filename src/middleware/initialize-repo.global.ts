import { DEFAULT_REPO_NAME } from '~/config'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.params.repo || Array.isArray(to.params.repo) || to.params.repo !== DEFAULT_REPO_NAME) {
    return navigateTo(`/${DEFAULT_REPO_NAME}`)
  }
})
