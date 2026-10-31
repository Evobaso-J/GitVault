import { isVaultRepo, type GhUserRepo } from '~~/server/resources/gitHubUserRepos'
import { uploadKeySchemaPost, type UploadKeyRecord, type UploadKeyResponse } from '~~/server/resources/uploadKey'

/**
 * Issues an upload key for `POST /ingest`: the session user's GitHub token, bound to one vault, sealed.
 * Its registry file `UPLOAD_KEYS_DIR/<kid>.json` makes it valid; deleting the file (Revoke on the page) revokes it.
 */
export default defineEventHandler(async (event): Promise<UploadKeyResponse> => {
  const { repo, platform } = await readValidatedBody(event, data => uploadKeySchemaPost.parse(data))
  const ghRepo = await github<Pick<GhUserRepo, 'name' | 'topics'>>(event, owner => `/repos/${owner}/${repo}`)
  if (!isVaultRepo(ghRepo)) throw createError({ statusCode: 400, statusMessage: `${repo} is not a vault` })

  const { user, secure } = await requireUserSession(event)
  if (!secure?.tokens.access_token) throw createError({ statusCode: 401 })

  const kid = crypto.randomUUID().replaceAll('-', '')
  const record: UploadKeyRecord = { platform, createdAt: new Date().toISOString() }
  await github(event, owner => `/repos/${owner}/${encodeURIComponent(ghRepo.name)}/contents/${UPLOAD_KEYS_DIR}/${kid}.json`, {
    method: 'PUT',
    body: { content: Buffer.from(JSON.stringify(record)).toString('base64'), message: 'chore: add phone upload key' },
  })
  const key = await sealUploadKey({
    v: 1,
    kid,
    iat: Date.now(),
    login: user.login,
    token: secure.tokens.access_token,
    repo: ghRepo.name,
  }, useRuntimeConfig(event).session.password)
  return { key, kid }
})
