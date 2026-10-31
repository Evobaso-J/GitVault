// `.gitvault/` holds the upload-key registry: hidden from listings and search, not a secret
export const EXCLUDE_FILES = ['.gitkeep', '.gitvault']

/** GitHub topic that marks a repo as a vault. */
export const GITVAULT_TOPIC = 'gitvault'

/**
 * Name prefix of vaults created before the topic existed; still detected as vaults.
 * New vaults keep it until the naming UI drops it.
 */
export const GITVAULT_REPO_PREFIX = 'gitvault-'

/** Name a vault is shown with: the repo name without the legacy prefix. */
export const getVaultLabel = (repoName: string) =>
  repoName.startsWith(GITVAULT_REPO_PREFIX) ? repoName.slice(GITVAULT_REPO_PREFIX.length) : repoName

export const isFileExcluded = (fileName: string) => EXCLUDE_FILES.some(excludeFile => fileName.includes(excludeFile))

/** Name of the published iOS shortcut; the `shortcuts://run-shortcut` link on the backup page must match it */
export const IOS_SHORTCUT_NAME = 'GitVault Backup'

/**
 * iCloud link of the published "GitVault Backup" shortcut (Shortcuts → Share → Copy iCloud Link), built per
 * README.md § Phone backup. Empty until published, which disables the "Add the shortcut" button.
 * iCloud links are snapshots: every edit of the shortcut needs a new link here.
 */
export const IOS_SHORTCUT_URL = ''

/**
 * Path under `public/` of the exported HTTP Shortcuts zip (README.md § Phone backup).
 * Empty until exported, which disables the "Import" button.
 */
export const ANDROID_SHORTCUT_ZIP = ''

export const HTTP_SHORTCUTS_PLAY_URL = 'https://play.google.com/store/apps/details?id=ch.rmy.android.http_shortcuts'

/** Deep link that imports a zip into HTTP Shortcuts; append the encoded zip URL */
export const HTTP_SHORTCUTS_IMPORT_URL = 'https://http-shortcuts.rmy.ch/import?url='
