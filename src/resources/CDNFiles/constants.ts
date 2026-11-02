/**
 * Whether a trimmed `name` can be one segment of a vault path: no `/`, not `.` or `..`,
 * no control characters (git paths can't hold NUL). Kept apart from `utils.ts`, which
 * is browser-only, because the server validates with it too.
 */
// eslint-disable-next-line no-control-regex
export const isFileNameValid = (name: string): boolean => /^[^/\x00-\x1f]+$/.test(name) && name !== '.' && name !== '..'

/**
 * The extension a rename keeps: the last dot segment with its dot (`archive.tar.gz` → `.gz`).
 * '' when there is none to keep (`README`, `.env`, `name.`): the whole name is editable.
 */
export const getLockedExtension = (name: string): string => {
  const dot = name.lastIndexOf('.')
  return dot > 0 && dot < name.length - 1 ? name.slice(dot) : ''
}

/** Codes the server puts in an error's `data.code`; the client shows `operationError.<code>` */
export type OperationErrorCode = 'nameTaken' | 'vaultChanged' | 'notRenamable'
