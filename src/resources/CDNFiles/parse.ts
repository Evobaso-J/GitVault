import type { CDNFile } from '.'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFiles = (ghRepoContentsData: GhRepoContentsResponseData | null): CDNFile[] => {
  if (!Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData is not an array')
    return []
  }
  return ghRepoContentsData.filter(content => content.type === 'file')
}

export const parseGhRepoContentsToCDNFile = (ghRepoContentsData: GhRepoContentsResponseData | null): CDNFile | null => {
  if (!ghRepoContentsData) return null
  if (Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData should not be an array')
    return null
  }
  return ghRepoContentsData
}
