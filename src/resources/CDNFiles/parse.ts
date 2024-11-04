import type { CDNFile } from '.'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export const parseGhRepoContentsToCDNFile = (ghRepoContentsData: GhRepoContentsResponseData): CDNFile[] => {
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
