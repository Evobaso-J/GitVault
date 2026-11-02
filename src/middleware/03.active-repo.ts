import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

// Remembers the vault in the URL as the last opened one. A missing or invalid repo is left to the page.
export default defineNuxtRouteMiddleware((to) => {
  const repo = String(to.params.repo)
  if (isRepoNameValid(repo)) useRepoStorage().lastOpenedRepository.value = repo
})
