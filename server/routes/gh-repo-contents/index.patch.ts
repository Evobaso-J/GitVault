import { fileSchemaRename } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event) => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const body = await readValidatedBody(event, data => fileSchemaRename.parse(data))
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  // Tree entries carry raw paths; the schema URL-encodes each segment
  return renameFile(event, { repo, path: path.split('/').map(decodeURIComponent).join('/'), branch: ghDefaultBranch }, body)
})
