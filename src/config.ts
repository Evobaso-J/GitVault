export const EXCLUDE_FILES = ['.gitkeep']

export const GITVAULT_REPO_PREFIX = 'gitvault-'

export const isFileExcluded = (fileName: string) => EXCLUDE_FILES.some(excludeFile => fileName.includes(excludeFile))
