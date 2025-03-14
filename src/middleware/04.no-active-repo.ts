export default defineNuxtRouteMiddleware(async () => {
  const { activeRepository } = useRepoStorage()

  if (activeRepository.value) {
    return navigateTo(`/${activeRepository.value}`)
  }
})
