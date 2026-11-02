export default defineEventHandler(async (event) => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema
    // Never the repo root
    .refine(({ path }) => path !== '')
    .parse(query))
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  // Tree entries carry raw paths; the schema URL-encodes each segment
  const folder = path.split('/').map(decodeURIComponent).join('/')
  return deleteVaultFolder(event, repo, ghDefaultBranch, folder)
})
