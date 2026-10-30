import type { CDNFile } from '.'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFiles = (ghRepoContentsData: GhRepoContentsResponseData | null | undefined): CDNFile[] => {
  if (!Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData is not an array')
    return []
  }
  return ghRepoContentsData.filter((content): content is CDNFile => content.type === 'file')
}

export const parseGhRepoContentsToCDNFile = (ghRepoContentsData: GhRepoContentsResponseData | null | undefined): CDNFile | null => {
  if (!ghRepoContentsData) return null
  if (Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData should not be an array')
    return null
  }
  if (!(ghRepoContentsData.type === 'file')) {
    console.error('ghRepoContentsData is not a CDNFile')
    return null
  }
  return ghRepoContentsData
}
