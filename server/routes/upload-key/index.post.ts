import { isVaultRepo, type GhUserRepo } from '~~/server/resources/gitHubUserRepos'
import { uploadKeySchemaPost, type UploadKeyResponse } from '~~/server/resources/uploadKey'

/** Issues an upload key: the session user's GitHub token, bound to one vault and folder, sealed for `POST /ingest` */
export default defineEventHandler(async (event): Promise<UploadKeyResponse> => {
  const { repo, folder } = await readValidatedBody(event, data => uploadKeySchemaPost.parse(data))
  const ghRepo = await github<Pick<GhUserRepo, 'name' | 'topics'>>(event, owner => `/repos/${owner}/${repo}`)
  if (!isVaultRepo(ghRepo)) throw createError({ statusCode: 400, statusMessage: `${repo} is not a vault` })

  const { user, secure } = await requireUserSession(event)
  if (!secure?.tokens.access_token) throw createError({ statusCode: 401 })
  const key = await sealUploadKey({
    v: 1,
    iat: Date.now(),
    login: user.login,
    token: secure.tokens.access_token,
    repo: ghRepo.name,
    folder,
  }, useRuntimeConfig(event).session.password)
  return { key }
})
