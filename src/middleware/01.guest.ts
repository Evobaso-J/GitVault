export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (loggedIn.value) {
    const { activeRepository } = useRepoStorage()
    return navigateTo(`/${activeRepository.value}`)
  }
})
