import type { GhRepoContentsResponseData } from '~~/server/resources/gitHubRepoContents'

export type FileExtension = `.${string}`

type ExtractArrayTypeFromUnion<T> = T extends Array<infer U> ? U : T
export type CDNFile = ExtractArrayTypeFromUnion<GhRepoContentsResponseData>
