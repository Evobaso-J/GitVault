export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return
  }
  const { activeRepository } = useRepoStorage()
  if (activeRepository.value) {
    return navigateTo(`/${activeRepository.value}`)
  }
  return navigateTo('/')
})
