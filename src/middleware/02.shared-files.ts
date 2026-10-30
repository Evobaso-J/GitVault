// Files shared while logged out wait in the stash: once the login lands on `/`, resume the share.
// Without a vault there is nowhere to upload them: let the user create one first.
export default defineNuxtRouteMiddleware(async () => {
  const { activeRepository } = useRepoStorage()
  if (activeRepository.value && await hasSharedFiles()) return navigateTo('/share')
})
