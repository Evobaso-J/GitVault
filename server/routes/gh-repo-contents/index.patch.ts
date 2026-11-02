import { fileSchemaRename } from '~~/server/resources/gitHubRepoContents'

export default defineEventHandler(async (event) => {
  const { repo, path } = await getValidatedQuery(event, query => vaultRepoQuerySchema.parse(query))
  const body = await readValidatedBody(event, data => fileSchemaRename.parse(data))
  const { public: { ghDefaultBranch } } = useRuntimeConfig(event)
  return renameFile(event, { repo, path, branch: ghDefaultBranch }, body)
})
