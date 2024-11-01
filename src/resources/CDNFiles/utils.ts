import type { FileExtension } from '.'

export const getFileExtension = (fileName: string): FileExtension => `.${fileName.split('.').pop()}`

export const codeFileExtensions: FileExtension[] = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json', '.md', '.html', '.css', '.yaml', '.yml']
export const imageFileExtensions: FileExtension[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
export const videoFileExtensions: FileExtension[] = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']

export const getIconFromFileName = (fileName: string): string => {
  const fileExtension = getFileExtension(fileName)
  if (fileExtension === '.pdf') return 'i-material-symbols-picture-as-pdf-outline'
  if (codeFileExtensions.includes(fileExtension)) return 'i-material-symbols-code'
  if (imageFileExtensions.includes(fileExtension)) return 'i-material-symbols-image'
  if (videoFileExtensions.includes(fileExtension)) return 'i-material-symbols-video'
  return 'i-material-symbols-file-copy'
}
