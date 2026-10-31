/**
 * Phone backup rules shared by the browser ("Back up now") and `POST /ingest`:
 * one folder, one date rule, one dedupe, one size cap.
 */

/** Base folder of every phone backup: `Photos/YYYY/MM/<name>` */
export const BACKUP_FOLDER = 'Photos'

/**
 * Largest file an upload can carry: the proxy receives it base64-encoded (+33%) in one
 * request, and Netlify functions reject request bodies over 6 MB.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

/** Commit message of every automatic backup: the backup page counts these commits */
export const BACKUP_COMMIT_MESSAGE = 'feat: phone backup'

/** Registry of upload keys: `<dir>/<kid>.json` exists while the key is valid */
export const UPLOAD_KEYS_DIR = '.gitvault/keys'

/** Git's id of the file's content (sha-1 of `blob <size>\0<bytes>`): the `sha` the repo tree lists for each file */
export const gitBlobSha = async (file: Blob): Promise<string> => {
  const bytes = await new Blob([`blob ${file.size}\0`, file]).arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

/** `docs/a.txt` → `docs/a (1).txt` */
export const withCopyNumber = (path: string, copy: number): string => {
  const slash = path.lastIndexOf('/') + 1
  const name = path.slice(slash)
  const dot = name.lastIndexOf('.')
  const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
  return `${path.slice(0, slash)}${stem} (${copy})${extension}`
}

export type YearMonth = { year: number, month: number }

/** Local year and month: the clock of whoever created the date (the phone in the browser) */
export const yearMonthOf = (date: Date): YearMonth => ({ year: date.getFullYear(), month: date.getMonth() + 1 })

/**
 * Year and month written at the start of an ISO date (`2026-10-31T23:30:00+01:00` → October),
 * as the phone formatted them: no time zone conversion, so a late-night photo keeps its month.
 */
export const parseTakenAt = (taken?: string): YearMonth | undefined => {
  const match = taken?.match(/^(\d{4})-(\d{2})/)
  const month = Number(match?.[2])
  return match && month >= 1 && month <= 12 ? { year: Number(match[1]), month } : undefined
}

/** `IMG_1.jpg` taken in October 2026 → `Photos/2026/10/IMG_1.jpg` */
export const getBackupPath = (name: string, { year, month }: YearMonth): string =>
  `${BACKUP_FOLDER}/${year}/${String(month).padStart(2, '0')}/${name}`

export type BackupIndex = { shas: Set<string>, paths: Set<string> }

/** Content shas and paths of every file in a repo tree */
export const indexTree = (tree: { path?: string, sha?: string, type?: string }[]): BackupIndex => {
  const index: BackupIndex = { shas: new Set(), paths: new Set() }
  for (const { path, sha, type } of tree) {
    if (type !== 'blob' || !path || !sha) continue
    index.shas.add(sha)
    index.paths.add(path)
  }
  return index
}

/**
 * Where a file goes: undefined when its content is already in the vault (anywhere, under any
 * name), else `target` or the first free `name (n).ext`. The index is updated, so a batch
 * dedupes against itself. Callers check the size cap before hashing.
 */
export const placeFile = (index: BackupIndex, { target, sha }: { target: string, sha: string }): string | undefined => {
  if (index.shas.has(sha)) return undefined
  let path = target
  for (let copy = 1; index.paths.has(path); copy++) path = withCopyNumber(target, copy)
  index.shas.add(sha)
  index.paths.add(path)
  return path
}
