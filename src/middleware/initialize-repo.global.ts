export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  const { activeRepository } = useRepoStorage()
  if (loggedIn.value && (!to.params.repo || Array.isArray(to.params.repo))) {
    return navigateTo(`/${activeRepository.value}`)
  }
})
