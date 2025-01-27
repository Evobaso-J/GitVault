export default defineNuxtRouteMiddleware((to) => {
  if (!to.params.repo) {
    return navigateTo('/gitvault-cdn-copy')
  }
})
