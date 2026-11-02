export const EXCLUDE_FILES = ['.gitkeep']

/** GitHub topic that marks a repo as a vault. */
export const GITVAULT_TOPIC = 'gitvault'

export const isFileExcluded = (fileName: string) => EXCLUDE_FILES.some(excludeFile => fileName.includes(excludeFile))

/**
 * Largest file an upload can carry: the proxy receives it base64-encoded (+33%) in one
 * request, and Netlify functions reject request bodies over 6 MB.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

/**
 * Vault size past which the app suggests a new vault: GitHub asks to keep repos ideally
 * under 1 GB and strongly under 5 GB (docs "About large files on GitHub").
 */
export const VAULT_FULL_BYTES = 5 * 1024 ** 3
