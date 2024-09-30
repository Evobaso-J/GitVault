import type { CDNFolder } from '.'
import type { ghContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFolder = (ghRepoContentsData: ghContentsResponseData): CDNFolder[] => {
  if (!Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData is not an array')
    return []
  }
  const foldersData = ghRepoContentsData.filter(content => content.type === 'dir')
  return foldersData.map(folder => ({
    name: folder.name,
    to: `/${folder.path}`,
  }))
}
