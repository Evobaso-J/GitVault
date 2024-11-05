import type { CDNFile } from '.'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFiles = (ghRepoContentsData: GhRepoContentsResponseData | null): CDNFile[] => {
  if (!Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData is not an array')
    return []
  }
  const filesData = ghRepoContentsData.filter(content => content.type === 'file')
  return filesData.map(file => ({
    name: file.name,
    to: `/${file.path}`,
    downloadUrl: file.download_url,
  }))
}

export const parseGhRepoContentsToCDNFile = (ghRepoContentsData: GhRepoContentsResponseData | null): CDNFile | null => {
  if (!ghRepoContentsData) return null
  if (Array.isArray(ghRepoContentsData)) {
    console.error('ghRepoContentsData should not be an array')
    return null
  }
  return {
    name: ghRepoContentsData.name,
    to: `/${ghRepoContentsData.path}`,
    downloadUrl: ghRepoContentsData.download_url,
  }
}
