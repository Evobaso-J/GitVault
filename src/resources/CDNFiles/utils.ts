import type { FileExtension } from '.'
import type { NuxtLinkProps } from '#app'

export const getFileExtension = (fileName: string): FileExtension => `.${fileName.split('.').pop()}`

export const codeFileExtensions: FileExtension[] = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json', '.html', '.css', '.yaml', '.yml'] as const
export const textFileExtensions: FileExtension[] = ['.txt', '.md', '.rtf'] as const
export const imageFileExtensions: FileExtension[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] as const
export const videoFileExtensions: FileExtension[] = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv'] as const
export const documentFileExtensions: FileExtension[] = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'] as const

export const getIconFromFileName = (fileName: string): string => {
  const fileExtension = getFileExtension(fileName)
  if (fileExtension === '.pdf') return 'i-mdi-file-pdf'
  if (codeFileExtensions.includes(fileExtension)) return 'i-mdi-file-code'
  if (imageFileExtensions.includes(fileExtension)) return 'i-mdi-file-image'
  if (videoFileExtensions.includes(fileExtension)) return 'i-mdi-file-video'
  return 'i-mdi-file-document'
}

export const downloadFile = (url: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getPathFromNuxtLinkTo = (nuxtLinkToProp: NuxtLinkProps['to']): string => {
  if (typeof nuxtLinkToProp === 'string') return nuxtLinkToProp
  if (!nuxtLinkToProp?.path) throw new Error('NuxtLinkProps.to.path is required')
  return nuxtLinkToProp.path
}
