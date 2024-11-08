import type { ExtractArrayTypeFromUnion } from '~/helpers'
import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export type FileExtension = `.${string}`

export type CDNFile = Extract<ExtractArrayTypeFromUnion<GhRepoContentsResponseData>, { type: 'file' }>
