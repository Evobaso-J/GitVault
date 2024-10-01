import type { FileExtension } from '.'

export const getExtensionFromFileName = (fileName: string): FileExtension => `.${fileName.split('.').pop()}`
