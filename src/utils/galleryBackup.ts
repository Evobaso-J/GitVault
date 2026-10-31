/** Git's id of the file's content (sha-1 of `blob <size>\0<bytes>`): the `sha` the repo tree lists for each file */
export const gitBlobSha = async (file: Blob): Promise<string> => {
  const bytes = await new Blob([`blob ${file.size}\0`, file]).arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

/** `IMG_1.jpg` modified in October 2026 → `Photos/2026/10/IMG_1.jpg` (local time) */
export const getGalleryPath = (file: Pick<File, 'name' | 'lastModified'>): string => {
  const date = new Date(file.lastModified)
  return `Photos/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${file.name}`
}

export type GalleryBackupPlan = {
  newFiles: File[]
  backedUp: File[]
  tooLarge: File[]
}

/**
 * Sorts the picked files by content: already in the vault (anywhere, under any name),
 * too large to upload, or new. A file picked twice is planned once and not counted again:
 * it isn't in the vault, so "already backed up" would be wrong.
 */
export const planGalleryBackup = async (files: File[], vaultShas: Set<string>, maxBytes: number): Promise<GalleryBackupPlan> => {
  const plan: GalleryBackupPlan = { newFiles: [], backedUp: [], tooLarge: [] }
  const picked = new Set<string>()
  // One file at a time: hashing reads the whole file into memory
  for (const file of files) {
    if (file.size > maxBytes) {
      plan.tooLarge.push(file)
      continue
    }
    const sha = await gitBlobSha(file)
    if (picked.has(sha)) continue
    picked.add(sha)
    if (vaultShas.has(sha)) plan.backedUp.push(file)
    else plan.newFiles.push(file)
  }
  return plan
}
