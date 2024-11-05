import type { CDNFolder } from '.'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFolders = (ghRepoContentsData: GhRepoContentsResponseData | null): CDNFolder[] => {
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
