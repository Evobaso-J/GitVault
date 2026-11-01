import type { CDNUserReposData } from '~~/server/resources/gitHubUserRepos'

export default defineEventHandler((event): Promise<CDNUserReposData> => listVaultRepos(event))
