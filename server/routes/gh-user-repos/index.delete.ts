export default defineEventHandler(async (event) => {
  const { repo } = await getValidatedQuery(event, query => vaultRepoQuerySchema.pick({ repo: true }).parse(query))
  const { secure } = await requireUserSession(event)
  // Sessions from before delete_repo was requested can't delete; 403 tells the client to sign in again
  if (!/\bdelete_repo\b/.test(secure?.tokens.scope ?? '')) {
    throw createError({ statusCode: 403, statusMessage: 'Missing the delete_repo scope: sign out and sign in again' })
  }
  await deleteVaultRepo(event, repo)
})
