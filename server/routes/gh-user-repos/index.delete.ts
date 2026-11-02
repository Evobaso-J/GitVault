export default defineEventHandler(async (event) => {
  const { repo } = await getValidatedQuery(event, query => vaultRepoQuerySchema.pick({ repo: true }).parse(query))
  await deleteVaultRepo(event, repo)
})
