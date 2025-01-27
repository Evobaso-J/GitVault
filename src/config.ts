export const EXCLUDE_FILES = ['.gitkeep']

export const DEFAULT_REPO_NAME = 'gitvault-starter'

export const isFileExcluded = (fileName: string) => EXCLUDE_FILES.some(excludeFile => fileName.includes(excludeFile))
