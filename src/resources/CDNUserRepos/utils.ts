import type { CDNUserRepoName } from '.'

/**
 * Whether `repoName` can be a GitHub repo name, so it is safe as one URL segment.
 * Whether the repo is a vault is decided server-side by `isVaultRepo`.
 */
export const isRepoNameValid = (repoName: string): repoName is CDNUserRepoName =>
  /^[\w.-]+$/.test(repoName) && repoName !== '.' && repoName !== '..'
