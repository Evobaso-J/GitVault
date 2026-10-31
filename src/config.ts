export const EXCLUDE_FILES = ['.gitkeep']

/** GitHub topic that marks a repo as a vault. */
export const GITVAULT_TOPIC = 'gitvault'

/**
 * Name prefix of vaults created before the topic existed; still detected as vaults.
 * New vaults keep it until the naming UI drops it.
 */
export const GITVAULT_REPO_PREFIX = 'gitvault-'

export const isFileExcluded = (fileName: string) => EXCLUDE_FILES.some(excludeFile => fileName.includes(excludeFile))

/**
 * Largest file an upload can carry: the proxy receives it base64-encoded (+33%) in one
 * request, and Netlify functions reject request bodies over 6 MB.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
