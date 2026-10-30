import { EXTENSION_TO_CATEGORY_MAP, FILE_CATEGORY_ICONS, type FileCategory } from './extensions'
import type { NuxtLinkProps } from '#app'
import { DownloadError } from '~/errors'
import type { RouteLocationAsRelativeGeneric, RouteLocationAsPathGeneric, RouteParamsGeneric } from '#vue-router'

export const getFileExtension = (fileName: string): string => fileName.split('.').pop() ?? ''
export const getFileCategory = (fileName: string): FileCategory | 'unsupported' => {
  const fileExtension = getFileExtension(fileName)
  return EXTENSION_TO_CATEGORY_MAP[fileExtension as keyof typeof EXTENSION_TO_CATEGORY_MAP] ?? 'unsupported'
}

export const getIconFromFileName = (fileName: string): string => {
  const fileCategory = getFileCategory(fileName)
  if (fileCategory === 'unsupported') return 'i-material-symbols-help-center-outline-rounded'
  return FILE_CATEGORY_ICONS[fileCategory]
}

// GitHub returns base64 of the raw UTF-8 bytes; atob alone yields Latin-1 mojibake
export const decodeBase64Utf8 = (content: string): string => new TextDecoder().decode(Uint8Array.from(atob(content), c => c.charCodeAt(0)))

export const downloadFile = async (url: string, fileName: string): Promise<Error | DownloadError | undefined> => {
  let response: Response
  try {
    response = await fetch(url)
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      return new DownloadError({
        message: error.message,
        name: 'DOWNLOAD_FAILED',
        statusCode: 404,
        cause: error.cause,
      })
    }
    return new Error()
  }
  const blob = await response.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export const getPathFromNuxtLinkTo = (nuxtLinkToProp: NuxtLinkProps['to']): string => {
  if (typeof nuxtLinkToProp === 'string') return nuxtLinkToProp
  if (!nuxtLinkToProp?.path) throw new Error('NuxtLinkProps.to.path is required')
  return nuxtLinkToProp.path
}

type VaultPathInput = {
  path: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined
  repo: RouteParamsGeneric[string] | undefined
}

// `#`, `?` and `%` are valid in file names but not raw in a URL path
const encodePath = (path: string): string => path.split('/').map(encodeURIComponent).join('/')

const getVaultUrl = ({ path, repo }: VaultPathInput, section?: 'file'): string => {
  if (typeof path !== 'string') {
    console.error('path is not a string:', path)
    return ''
  }
  if (typeof repo !== 'string') {
    console.error('repo is not a string:', repo)
    return ''
  }
  return `/${[repo, section, encodePath(path)].filter(Boolean).join('/')}`
}

/** App URL of a file's page, e.g. `/gitvault-a/file/docs/a%20%231.txt` */
export const getPathToFile = (input: VaultPathInput): string => getVaultUrl(input, 'file')

/** App URL of a folder, e.g. `/gitvault-a/docs/2026` */
export const getPathToFolder = (input: VaultPathInput): string => getVaultUrl(input)
