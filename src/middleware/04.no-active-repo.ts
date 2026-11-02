export default defineNuxtRouteMiddleware(async () => {
  const { activeRepository } = useRepoStorage()

  if (activeRepository.value) {
    return navigateTo(`/vaults/${activeRepository.value}`)
  }
})
