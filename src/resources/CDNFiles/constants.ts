/**
 * Whether a trimmed `name` can be one segment of a vault path: no `/`, not `.` or `..`,
 * no control characters (git paths can't hold NUL). Kept apart from `utils.ts`, which
 * is browser-only, because the server validates with it too.
 */
// eslint-disable-next-line no-control-regex
export const isFileNameValid = (name: string): boolean => /^[^/\x00-\x1f]+$/.test(name) && name !== '.' && name !== '..'
