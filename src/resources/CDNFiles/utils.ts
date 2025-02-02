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

export const getPathToFile = ({ fileName, repo }: { fileName: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined, repo: RouteParamsGeneric[string] | undefined }): string => {
  if (typeof fileName !== 'string') {
    console.error('fileName is not a string:', fileName)
    return ''
  }
  if (typeof repo !== 'string') {
    console.error('fileName is not a string:', fileName)
    return ''
  }
  return `/${repo}/file/${fileName}`
}
