import { DEFAULT_REPO_NAME } from '~/config'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value && (!to.params.repo || Array.isArray(to.params.repo))) {
    return navigateTo(`/${DEFAULT_REPO_NAME}`)
  }
})
